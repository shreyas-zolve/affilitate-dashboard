/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error('Server error:', err);
  
  // Extract error details
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
};

export default errorHandler;