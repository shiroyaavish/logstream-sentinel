import * as argon2 from "argon2"

const encPassword = (password: string): Promise<string> => {
    return argon2.hash(password, { secret: Buffer.from(process.env.ARGON2_SECRET) })
}

const verifyPassword = (hash: string, password: string): Promise<boolean> => {
    return argon2.verify(hash, password, { secret: Buffer.from(process.env.ARGON2_SECRET) })
}

export { encPassword, verifyPassword }