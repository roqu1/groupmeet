package com.groupmeet.application.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Base class for testing API controllers
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class BaseControllerTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    /**
     * Performs a GET request to the specified URL
     * 
     * @param url URL for the request
     * @return ResultActions object for further assertions
     * @throws Exception if an error occurs during the request
     */
    protected ResultActions performGet(String url) throws Exception {
        MockHttpServletRequestBuilder request = MockMvcRequestBuilders
                .get(url)
                .contentType(MediaType.APPLICATION_JSON);
        return mockMvc.perform(request);
    }

    /**
     * Performs a POST request to the specified URL with a request body
     * 
     * @param url  URL for the request
     * @param body request body (will be converted to JSON)
     * @return ResultActions object for further assertions
     * @throws Exception if an error occurs during the request
     */
    protected ResultActions performPost(String url, Object body) throws Exception {
        MockHttpServletRequestBuilder request = MockMvcRequestBuilders
                .post(url)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body));
        return mockMvc.perform(request);
    }

    /**
     * Performs a PUT request to the specified URL with a request body
     * 
     * @param url  URL for the request
     * @param body request body (will be converted to JSON)
     * @return ResultActions object for further assertions
     * @throws Exception if an error occurs during the request
     */
    protected ResultActions performPut(String url, Object body) throws Exception {
        MockHttpServletRequestBuilder request = MockMvcRequestBuilders
                .put(url)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body));
        return mockMvc.perform(request);
    }

    /**
     * Performs a DELETE request to the specified URL
     * 
     * @param url URL for the request
     * @return ResultActions object for further assertions
     * @throws Exception if an error occurs during the request
     */
    protected ResultActions performDelete(String url) throws Exception {
        MockHttpServletRequestBuilder request = MockMvcRequestBuilders
                .delete(url)
                .contentType(MediaType.APPLICATION_JSON);
        return mockMvc.perform(request);
    }
}