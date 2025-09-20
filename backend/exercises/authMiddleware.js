const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ message: 'Authentication token is required.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(403).send({ message: 'Invalid or expired token.' });
    }
};