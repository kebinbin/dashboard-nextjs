"use server";
// Server Actions: can be used in client or server components, but must be called from the server.
// Server Actions can be used to perform server-side logic, such as database queries or API calls, and can be invoked from client components.
// Behind the scenes, Server Actions create a POST API endpoint. This is why you don't need to create API endpoints manually when using Server Actions.
import { z } from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({ invalid_type_error: "Please select a customer." }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Amount must be greater than 0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select a status.",
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(
  prevState: State,
  data: FormData,
): Promise<State> {
  const validatedFields = CreateInvoice.safeParse({
    customerId: data.get("customerId"),
    amount: data.get("amount"),
    status: data.get("status"),
  });
  //const rawFormData = Object.fromEntries(data.entries()); // Convert FormData to a plain object

  console.log(
    "Validated Fields:",
    JSON.stringify(validatedFields.error?.flatten(), null, 2),
  ); // Log the validated fields for debugging

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing fields. Failed to create invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100; // Convert amount to cents
  const [date] = new Date().toISOString().split("T"); // Get the current date in ISO format
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    // We'll also log the error to the console for now
    console.error("Error creating invoice:", error);
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  console.log(
    `Invoice created for customer ${customerId} with amount ${amountInCents} and status ${status} on ${date}`,
  );
  revalidatePath("/dashboard/invoices"); // Revalidate the invoices page to reflect the new invoice
  redirect("/dashboard/invoices"); // Redirect to the invoices page after creating the invoice
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
): Promise<State> {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation Error: Please check the form fields.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100; // Convert amount to cents

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  } catch (error) {
    console.error("Error updating invoice:", error);
    return {
      message: "Database Error: Failed to Update Invoice.",
    };
  }

  console.log(
    `Invoice ${id} updated with customer ${customerId}, amount ${amountInCents}, and status ${status}`,
  );
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  throw new Error("This is an intential error to test error boundaries.");

  //Unreachable code block
  try {
    await sql`
      DELETE FROM invoices
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return {
      message: "Database Error: Failed to Delete Invoice.",
    };
  }

  console.log(`Invoice ${id} deleted`);
  revalidatePath("/dashboard/invoices");
}
