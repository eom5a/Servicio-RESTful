package edu.upc.eetac.dsa.beeter;

import edu.upc.eetac.dsa.beeter.dao.StingDAO;
import edu.upc.eetac.dsa.beeter.dao.StingDAOImpl;
import edu.upc.eetac.dsa.beeter.entity.AuthToken;
import edu.upc.eetac.dsa.beeter.entity.Sting;
import edu.upc.eetac.dsa.beeter.entity.StingCollection;

import javax.ws.rs.*;
import javax.ws.rs.core.*;
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.SQLException;

/**
 * Created by Enric on 27/03/2016.
 */
@Path("stings")
public class StingResource {
    @Context
    private SecurityContext securityContext;

    @POST
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(BeeterMediaType.BEETER_STING)
    public Response createSting(@FormParam("subject") String subject, @FormParam("content") String content, @Context UriInfo uriInfo) throws URISyntaxException {
        if(subject==null || content == null)
            throw new BadRequestException("all parameters are mandatory");
        StingDAO stingDAO = new StingDAOImpl();
        Sting sting = null;
        AuthToken authenticationToken = null;
        try {
            sting = stingDAO.createSting(securityContext.getUserPrincipal().getName(), subject, content);
        } catch (SQLException e) {
            throw new InternalServerErrorException();
        }
        URI uri = new URI(uriInfo.getAbsolutePath().toString() + "/" + sting.getId());
        return Response.created(uri).type(BeeterMediaType.BEETER_STING).entity(sting).build();
    }

    @GET
    @Produces(BeeterMediaType.BEETER_STING_COLLECTION)
    public StingCollection getStings(){
        StingCollection stingCollection = null;
        StingDAO stingDAO = new StingDAOImpl();
        try {
            stingCollection = stingDAO.getStings();
        } catch (SQLException e) {
            throw new InternalServerErrorException();
        }

        return stingCollection;
    }

    @Path("/{id}")
    @GET
    @Produces(BeeterMediaType.BEETER_STING)
    public Sting getSting(@PathParam("id") String id){
        Sting sting = null;
        StingDAO stingDAO = new StingDAOImpl();
        try {
            sting = stingDAO.getStingById(id);
            if(sting == null)
                throw new NotFoundException("Sting with id = "+id+" doesn't exist");
        } catch (SQLException e) {
            throw new InternalServerErrorException();
        }
        return sting;
    }

    @Path("/{id}")
    @PUT
    @Consumes(BeeterMediaType.BEETER_STING)
    @Produces(BeeterMediaType.BEETER_STING)
    public Sting updateUSting(@PathParam("id") String id, Sting sting) {
        if(sting == null)
            throw new BadRequestException("entity is null");
        if(!id.equals(sting.getId()))
            throw new BadRequestException("path parameter id and entity parameter id doesn't match");

        String userid = securityContext.getUserPrincipal().getName();
        if(!userid.equals(sting.getUserid()))
            throw new ForbiddenException("operation not allowed");

        StingDAO stingDAO = new StingDAOImpl();
        try {
            sting = stingDAO.updateSting(id, sting.getSubject(), sting.getContent());
            if(sting == null)
                throw new NotFoundException("Sting with id = "+id+" doesn't exist");
        } catch (SQLException e) {
            throw new InternalServerErrorException();
        }
        return sting;
    }

    @Path("/{id}")
    @DELETE
    public void deleteSting(@PathParam("id") String id) {
        String userid = securityContext.getUserPrincipal().getName();
        StingDAO stingDAO = new StingDAOImpl();
        try {
            String ownerid = stingDAO.getStingById(id).getUserid();
            if(!userid.equals(ownerid))
                throw new ForbiddenException("operation not allowed");
            if(!stingDAO.deleteSting(id))
                throw new NotFoundException("Sting with id = "+id+" doesn't exist");
        } catch (SQLException e) {
            throw new InternalServerErrorException();
        }
    }
}
