module.exports = (req, res) => {
    res.status(200).json({
        success: true,
        message: "Enquiry API is working!"
    });
};
