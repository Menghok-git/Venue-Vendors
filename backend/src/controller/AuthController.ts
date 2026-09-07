import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entity/User";

const userRepo = () => AppDataSource.getRepository(User);

// Shape returned to the client: NEVER includes passwordHash.
function toSafeUser(u: User) {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    name: u.fullName,
    phone: u.phone,
    avatarUrl: u.avatarUrl,
    dateJoined: u.dateJoined,
  };
}

function signToken(u: User) {
  const secret: jwt.Secret = process.env.JWT_SECRET ?? "dev-secret";
  const options: jwt.SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN ?? "1d") as any };
  return jwt.sign({ id: u.id, email: u.email, role: u.role }, secret, options);
}

// POST /api/auth/register
export async function register(req: Request, res: Response) {
  const { email, password, fullName, phone, role } = req.body as {
    email: string; password: string; fullName: string; phone?: string; role?: UserRole;
  };

  // Public sign-up is hirer/vendor only; admin accounts come from the seed script.
  const safeRole: UserRole = role === "vendor" ? "vendor" : "hirer";

  const existing = await userRepo().findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "An account with that email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = userRepo().create({
    email, passwordHash, fullName, phone: phone ?? null, role: safeRole,
  });
  await userRepo().save(user);

  return res.status(201).json({ token: signToken(user), user: toSafeUser(user) });
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };

  const user = await userRepo().findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid email or password." });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid email or password." });

  return res.json({ token: signToken(user), user: toSafeUser(user) });
}

//GET /api/auth/me  (protected)
export async function me(req: Request, res: Response) {
  const user = await userRepo().findOne({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ message: "User not found." });
  return res.json({ user: toSafeUser(user) });
}

//PUT /api/auth/me  (protected) update own profile
export async function updateMe(req: Request, res: Response) {
  const user = await userRepo().findOne({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ message: "User not found." });

  const { fullName, phone, avatarUrl } = req.body as {
    fullName?: string; phone?: string; avatarUrl?: string;
  };
  if (fullName !== undefined) user.fullName = fullName;
  if (phone !== undefined) user.phone = phone;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  await userRepo().save(user);

  return res.json({ user: toSafeUser(user) });
}
