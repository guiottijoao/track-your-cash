# Auth Middleware in Express + TypeScript

## 1. What is Authentication?

Authentication is the process of verifying **who** is making a request to your API.

When a user logs in, your server:
1. Checks their email and password
2. If valid, generates a **token** and sends it back
3. The client stores that token and sends it on every future request
4. Your server reads the token to know who is making the request

The most common token format is **JWT (JSON Web Token)**.

---

## 2. What is a JWT?

A JWT is a string with 3 parts separated by dots:

```
header.payload.signature
```

Example:
```
eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MX0.abc123xyz
```

- **Header** — algorithm used to sign the token
- **Payload** — the data inside (e.g. `{ id: 1 }`)
- **Signature** — proves the token wasn't tampered with

The payload is **not encrypted** — just base64 encoded. Never put passwords or sensitive data in it.
The signature is what makes it secure — only your server can produce a valid signature because only your server knows the **secret key**.

---

## 3. What is Middleware?

In Express, middleware is a function that runs **between** receiving the request and sending the response.

```
Request → Middleware 1 → Middleware 2 → Controller → Response
```

Each middleware receives `(req, res, next)` and either:
- Calls `next()` to pass to the next step
- Calls `res.json(...)` to stop the chain and respond directly

Auth middleware sits before your controllers and checks if the request has a valid token.

---

## 4. Installing Dependencies

```bash
npm install jsonwebtoken bcrypt
npm install -D @types/jsonwebtoken @types/bcrypt
```

---

## 5. Setting Up the Secret Key

Your JWT secret should live in your `.env` file — never hardcode it.

```env
JWT_SECRET=your_super_secret_key_here
```

---

## 6. Extending the Request Type

TypeScript doesn't know about `req.user` by default. You need to tell it.

Express defines its `Request` interface internally without a `user` property. TypeScript has a feature called **declaration merging** that lets you extend existing types from third-party libraries by redeclaring them in a `.d.ts` file.

Create `src/types/express.d.ts`:

```ts
import { User } from "../../generated/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
```

TypeScript **merges** this with Express's existing `Request` interface — it doesn't replace it, it adds to it. The result is as if Express had declared `user` from the start:

```ts
// Express's original (untouched)
interface Request {
  body: any
  params: any
}

// Your addition
interface Request {
  user?: User
}

// What TypeScript sees after merging
interface Request {
  body: any
  params: any
  user?: User  // ✅ now valid
}
```

The `declare global` wrapper is needed because Express's namespace lives in the global scope.

The `?` makes it optional because unauthenticated routes won't have `req.user` set. In protected controllers you use `req.user!.id` — the `!` tells TypeScript "I know this exists here".

Your `tsconfig.json` already has `"include": ["src/**/*"]` so TypeScript will pick up this file automatically.

---

## 7. Creating the Auth Middleware

Create `src/app/middleware/auth.ts`:

```ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../lib/prisma";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Get the token from the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>" → "<token>"

  try {
    // 2. Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };

    // 3. Find the user in the database
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 4. Attach the user to the request object
    req.user = user;

    // 5. Pass to the next middleware or controller
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
```

---

## 8. Register and Login (src/app/services/users.ts)

Add these two functions to your existing users service.

**Register** — creates the user and returns a token so they are immediately logged in:

```ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../lib/prisma";

export const register = async (name: string, email: string, password: string) => {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) throw Object.assign(new Error("Email already in use"), { status: 409 });

  const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  return { token };
};
```

The `10` in `bcrypt.hash` is the number of **salt rounds** — how many times the hashing algorithm runs. Higher = more secure but slower. 10 is the standard default.

**Login** — verifies credentials and returns a token:

```ts
export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw Object.assign(new Error("Invalid credentials"), { status: 401 });

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) throw Object.assign(new Error("Invalid credentials"), { status: 401 });

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  return { token };
};
```

Note: both "user not found" and "wrong password" return the same message "Invalid credentials" — this is intentional. Telling the client which one failed would help attackers enumerate valid emails.

---

## 9. Auth Controller (src/app/controllers/auth-controller.ts)

Register and login are public endpoints — they don't go through the auth middleware. Create a dedicated controller for them:

```ts
import { Request, Response, NextFunction } from "express";
import * as userService from "../services/users";
import { createUserSchema } from "../schemas/user";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: z.flattenError(parsed.error) });
    }
    const result = await userService.register(
      parsed.data.name,
      parsed.data.email,
      parsed.data.password
    );
    res.status(201).json(result); // returns { token }
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: z.flattenError(parsed.error) });
    }
    const result = await userService.login(parsed.data.email, parsed.data.password);
    res.status(200).json(result); // returns { token }
  } catch (err) {
    next(err);
  }
};
```

---

## 10. Auth Routes (src/app/routes/auth.ts)

Create a route file for the public auth endpoints:

```ts
import { Router } from "express";
import * as authController from "../controllers/auth-controller";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;
```

---

## 11. Protecting Routes (src/app/routes/accounts.ts)

Create a route file for accounts. Apply `authenticate` before the controllers:

```ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as accountController from "../controllers/account-controller";

const router = Router();

router.use(authenticate); // all routes below require a valid token

router.get("/", accountController.getAll);
router.get("/:id", accountController.getById);
router.post("/", accountController.create);
router.put("/:id", accountController.update);
router.delete("/:id", accountController.remove);

export default router;
```

---

## 12. Registering Routes (src/app/routes/index.ts)

Wire everything together in the main router. Auth routes are public, account routes are protected:

```ts
import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import accountRoutes from "./accounts";

const router = Router();

router.use("/auth", authRoutes);         // public — no middleware
router.use("/users", userRoutes);        // public — no middleware
router.use("/accounts", accountRoutes);  // protected — authenticate is applied inside accountRoutes

export default router;
```

Your existing `src/app/index.ts` already mounts this router under `/api`, so the final endpoints will be:

```
POST /api/auth/register
POST /api/auth/login
GET  /api/accounts
POST /api/accounts
...
```

---

## 13. Using req.user in a Controller (src/app/controllers/account-controller.ts)

Now that the middleware attaches the user, your controller can access it to inject the `userId` server-side:

```ts
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: z.flattenError(parsed.error) });
    }

    const account = await accountService.create({
      ...parsed.data,
      user: { connect: { id: req.user!.id } }, // from the token, not the request body
    });

    res.status(201).json(account);
  } catch (err) {
    next(err);
  }
};
```

---

## 14. Full Request Flow

```
POST /api/auth/register  →  no middleware  →  authController.register  →  201 { token }
POST /api/auth/login     →  no middleware  →  authController.login     →  200 { token }

POST /api/accounts
Authorization: Bearer eyJhbGci...
Body: { name, type, ... }
         ↓
authenticate middleware (src/app/middleware/auth.ts)
  - reads Authorization header
  - verifies JWT with JWT_SECRET
  - finds user in DB
  - sets req.user = { id: 1, name: "John", ... }
  - calls next()
         ↓
accountController.create (src/app/controllers/account-controller.ts)
  - validates req.body with Zod
  - calls accountService.create with parsed.data + req.user.id
  - returns 201 with the created account
```

---

## 15. Common Mistakes

| Mistake | Why it's wrong |
|---|---|
| Putting `userId` in the request body | Any user could fake another user's ID |
| Using `req.body.user` instead of `req.user` | `req.user` is set by middleware, not the client |
| Hardcoding the JWT secret | If your code leaks, all tokens are compromised |
| Not handling expired tokens | `jwt.verify` throws on expiry — always wrap in try/catch |
| Storing passwords in the JWT payload | JWTs are not encrypted, anyone can decode the payload |
| Returning different errors for wrong email vs wrong password | Helps attackers enumerate valid emails |
