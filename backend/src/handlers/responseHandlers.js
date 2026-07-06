"use strict";

export const handleSuccess = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    message,
    data,
    status: "Success",
  });
};

export const handleErrorClient = (res, statusCode, message, errorDetails = null) => {
  res.status(statusCode).json({
    message,
    errorDetails,
    status: "Client error",
  });
};

export const handleErrorServer = (res, statusCode, message, errorDetails = null) => {
  console.error("Server Error:", message, errorDetails);
  res.status(statusCode).json({
    message,
    errorDetails: "Ocurrio un error interno. Intenta nuevamente o contacta a soporte.",
    status: "Server error",
  });
};
