export const ApiResponse = {
  success: (res, message, data = {}, statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  },

  error: (res, message, error = {}, statusCode = 500) => {
    return res.status(statusCode).json({
      success: false,
      message,
      error
    });
  }
};
