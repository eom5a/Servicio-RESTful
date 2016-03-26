package edu.upc.eetac.dsa.beeter.dao;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Enumeration;
import java.util.Properties;
import java.util.PropertyResourceBundle;
import java.util.ResourceBundle;

/**
 * Created by Enric on 26/03/2016.
 */
public class Database {
    private static Database instance = null;
    private DataSource ds;

    public Database() {
        PropertyResourceBundle prb = (PropertyResourceBundle) ResourceBundle.getBundle("hikari");
        Enumeration<String> keys = prb.getKeys();
        Properties properties = new Properties();
        while(keys.hasMoreElements()){
            String key = keys.nextElement();
            properties.setProperty(key, prb.getString(key));
        }

        //HikariConfig config = new HikariConfig(Database.class.getClassLoader().getResource("hikari.properties").getFile());
        HikariConfig config = new HikariConfig(properties);
        ds = new HikariDataSource(config);
    }

    private final static Database getInstance() {
        if (instance == null)
            instance = new Database();
        return instance;
    }

    public final static Connection getConnection() throws SQLException {
        return getInstance().ds.getConnection();
    }
}
