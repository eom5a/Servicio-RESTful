package edu.upc.eetac.dsa.beeter.entity;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Created by Enric on 26/03/2016.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BeeterError {
    private int status;
    private String reason;

    public BeeterError() {
    }

    public BeeterError(int status, String reason) {
        this.status = status;
        this.reason = reason;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
