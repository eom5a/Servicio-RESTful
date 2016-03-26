package edu.upc.eetac.dsa.beeter.auth;

import edu.upc.eetac.dsa.beeter.dao.AuthTokenDAOImpl;
import edu.upc.eetac.dsa.beeter.entity.Role;

import javax.annotation.Priority;
import javax.ws.rs.InternalServerErrorException;
import javax.ws.rs.Priorities;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import javax.ws.rs.ext.Provider;
import java.io.IOException;
import java.security.Principal;
import java.sql.SQLException;
import java.util.List;

/**
 * Created by Enric on 27/03/2016.
 */
@Provider //Indicamos a Jersey que el filtro es interesante
@Priority(Priorities.AUTHENTICATION)//Nos aseguramos que el filtro de auth se ejecuta tan pronto como es posible
public class AuthRequestFilter implements ContainerRequestFilter {
    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        if(Authorized.getInstance().isAuthorized(requestContext))
            return;
        //Obtenemos el token de la cabecera y en el caso de que no haya que lanze una expeción
        String token = requestContext.getHeaderString("X-Auth-Token");
        if(token == null)
        {
            throw new WebApplicationException(Response.Status.UNAUTHORIZED);
        }
        //Comprobamos si el token es válido y en ese caso recuperar la información del usuario
        final boolean secure = requestContext.getUriInfo().getAbsolutePath().getScheme().equals("https");

        try {
            final UserInfo principal = (new AuthTokenDAOImpl()).getUserByAuthToken(token);
            if(principal==null)
                throw new WebApplicationException("auth token doesn't exists", Response.Status.UNAUTHORIZED);
            requestContext.setSecurityContext(new SecurityContext() {
                @Override
                public Principal getUserPrincipal() {
                    return principal;
                }

                @Override
                public boolean isUserInRole(String s) {
                    List<Role> roles = null;
                    if (principal != null) roles = principal.getRoles();
                    return (roles.size() > 0 && roles.contains(Role.valueOf(s)));
                }

                @Override
                public boolean isSecure() {
                    return secure;
                }

                @Override
                public String getAuthenticationScheme() {
                    return "X-Auth-Token";
                }
            });
        } catch (SQLException e) {
            throw new InternalServerErrorException();
        }
    }
}
