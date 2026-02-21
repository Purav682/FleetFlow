"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAuth } from "@/components/providers/AuthProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole, readError } from "@/lib/api-client";

const roles: UserRole[] = ["Manager", "Dispatcher", "SafetyOfficer", "Analyst"];

const registerSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
    role: z.enum(["Manager", "Dispatcher", "SafetyOfficer", "Analyst"]),
    department: z.string().optional(),
    region: z.string().optional(),
    hub_location: z.string().optional(),
    certification_id: z.string().optional(),
    finance_unit: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "Dispatcher",
      department: "",
      region: "",
      hub_location: "",
      certification_id: "",
      finance_unit: "",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (values: RegisterForm) => {
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        department: values.department || undefined,
        region: values.region || undefined,
        hub_location: values.hub_location || undefined,
        certification_id: values.certification_id || undefined,
        finance_unit: values.finance_unit || undefined,
      });
      router.push("/auth/login");
    } catch (err) {
      setError("root", { message: readError(err, "Registration failed") });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Create FleetFlow User</CardTitle>
          <CardDescription>Register a new role-based account</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {errors.root?.message && (
              <Alert variant="destructive" className="md:col-span-2">
                <AlertDescription>{errors.root.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2 md:col-span-2">
              <Label>Name</Label>
              <Input disabled={isSubmitting} {...register("name")} />
              {errors.name?.message && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Email</Label>
              <Input type="email" disabled={isSubmitting} {...register("email")} />
              {errors.email?.message && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(value: UserRole) => {
                  setValue("role", value, { shouldValidate: true });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role?.message && <p className="text-xs text-red-600">{errors.role.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Input disabled={isSubmitting} {...register("department")} />
            </div>

            <div className="space-y-2">
              <Label>Region</Label>
              <Input disabled={isSubmitting} {...register("region")} />
            </div>

            <div className="space-y-2">
              <Label>Hub Location</Label>
              <Input disabled={isSubmitting} {...register("hub_location")} />
            </div>

            <div className="space-y-2">
              <Label>Certification ID</Label>
              <Input disabled={isSubmitting} {...register("certification_id")} />
            </div>

            <div className="space-y-2">
              <Label>Finance Unit</Label>
              <Input disabled={isSubmitting} {...register("finance_unit")} />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" disabled={isSubmitting} {...register("password")} />
              {errors.password?.message && <p className="text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input type="password" disabled={isSubmitting} {...register("confirmPassword")} />
              {errors.confirmPassword?.message && (
                <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 items-stretch">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
