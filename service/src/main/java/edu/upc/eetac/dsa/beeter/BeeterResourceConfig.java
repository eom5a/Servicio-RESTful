package edu.upc.eetac.dsa.beeter;

import org.glassfish.jersey.server.ResourceConfig;

/**
 * Created by Enric on 24/03/2016.
 */
public class BeeterResourceConfig extends ResourceConfig {
    public BeeterResourceConfig() {
        packages("edu.upc.eetac.dsa.beeter");
    }
}
