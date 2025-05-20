import jwt from 'jsonwebtoken';

export const createToken = (userId, res) => {

    // jwt.sign() generates a token
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: '1d',
    })

    // stores token in a cookie 
    res.cookie('jwt', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV !== 'development'
    })

    return token
}