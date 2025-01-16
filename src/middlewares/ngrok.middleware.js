const ngrokWarningBypass = (req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "true");
  console.log("ngrok-skip-browser-warning header set");
  next();
};

export default ngrokWarningBypass;
