package edu.upc.eetac.dsa.beeter;

import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.filter.RolesAllowedDynamicFeature;

/**
 * Created by Enric on 24/03/2016.
 */
public class BeeterResourceConfig extends ResourceConfig {
    public BeeterResourceConfig() {
        packages("edu.upc.eetac.dsa.beeter");
        packages("edu.upc.eetac.dsa.beeter.auth");
        register(RolesAllowedDynamicFeature.class);
    }
}
