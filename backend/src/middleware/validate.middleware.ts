import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

//runs after express-validator checks in a route; returns 400 + the error list.
//every form-handling route MUST validate here (backend) as well as on the React side.
export function handleValidation(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}
