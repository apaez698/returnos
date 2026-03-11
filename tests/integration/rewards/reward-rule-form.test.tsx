import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { RewardRuleForm } from "@/components/rewards/reward-rule-form";
import { createRewardRuleSchema } from "@/lib/rewards/schema";
import {
  type RewardActionState,
  initialRewardActionState,
} from "@/lib/rewards/types";

function makeIdleAction() {
  return vi.fn(
    async (): Promise<RewardActionState> => initialRewardActionState,
  );
}

function makeValidationAwareAction() {
  return vi.fn(
    async (
      _previousState: RewardActionState,
      formData: FormData,
    ): Promise<RewardActionState> => {
      const payload = {
        name: String(formData.get("name") ?? ""),
        points_required: Number(formData.get("points_required") ?? 0),
        reward_description: String(formData.get("reward_description") ?? ""),
        is_active: formData.get("is_active") === "on",
      };

      const parsed = createRewardRuleSchema.safeParse(payload);

      if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;

        return {
          status: "error",
          message: "Please fix the form errors.",
          fieldErrors: {
            name: fieldErrors.name?.[0],
            points_required: fieldErrors.points_required?.[0],
            reward_description: fieldErrors.reward_description?.[0],
          },
        };
      }

      return {
        status: "success",
        message: "Reward rule saved.",
      };
    },
  );
}

describe("RewardRuleForm integration", () => {
  it("renders all expected fields", () => {
    render(<RewardRuleForm action={makeIdleAction()} />);

    expect(
      screen.getByRole("heading", { name: /create reward rule/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/points required/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reward description/i)).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /active/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save reward rule/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors for invalid submit", async () => {
    const user = userEvent.setup();
    const action = makeValidationAwareAction();

    render(<RewardRuleForm action={action} />);

    await user.click(screen.getByRole("button", { name: /save reward rule/i }));

    expect(
      await screen.findByText("Please fix the form errors."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Name must be at least 2 characters."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Points must be greater than 0."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Reward description must be at least 2 characters."),
    ).toBeInTheDocument();
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("calls mocked submit handler on valid submit", async () => {
    const user = userEvent.setup();
    const action = makeValidationAwareAction();

    render(<RewardRuleForm action={action} />);

    await user.type(screen.getByLabelText(/name/i), "Free coffee");
    await user.type(screen.getByLabelText(/points required/i), "50");
    await user.type(
      screen.getByLabelText(/reward description/i),
      "Any medium coffee for free.",
    );

    await user.click(screen.getByRole("button", { name: /save reward rule/i }));

    await waitFor(() => {
      expect(action).toHaveBeenCalledTimes(1);
    });

    const [, formData] = action.mock.calls[0];
    expect(formData.get("name")).toBe("Free coffee");
    expect(formData.get("points_required")).toBe("50");
    expect(formData.get("reward_description")).toBe(
      "Any medium coffee for free.",
    );
    expect(formData.get("is_active")).toBe("on");
  });

  it("allows changing the is_active checkbox", async () => {
    const user = userEvent.setup();

    render(<RewardRuleForm action={makeIdleAction()} />);

    const activeCheckbox = screen.getByRole("checkbox", { name: /active/i });

    expect(activeCheckbox).toBeChecked();

    await user.click(activeCheckbox);
    expect(activeCheckbox).not.toBeChecked();

    await user.click(activeCheckbox);
    expect(activeCheckbox).toBeChecked();
  });
});
