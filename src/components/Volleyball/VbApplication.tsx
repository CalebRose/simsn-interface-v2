import { FC } from "react";
import { VbRequestAnswer } from "../../_services/volleyballService";

// The application questions every volleyball request carries. They are the
// shared request window's questions, so an application reads the same
// whichever way it was sent. The API stores them as question and answer
// pairs, and a stored application is matched back by the question's words.

export type VbAnswerKey =
  | "discordUsername"
  | "howMuchTimeAnswer"
  | "howDidYouHearAboutSimSN"
  | "communityReference"
  | "aboutYourself";

export type VbAnswerValues = Record<VbAnswerKey, string>;

export const vbQuestions: Array<{
  key: VbAnswerKey;
  question: string;
  hint?: string;
  placeholder: string;
  required: boolean;
  long?: boolean;
}> = [
  {
    key: "discordUsername",
    question: "Discord username",
    hint: "Optional. A lot of the community also talks on our Discord server.",
    placeholder: "e.g. yourname or yourname#0000",
    required: false,
  },
  {
    key: "howMuchTimeAnswer",
    question: "How much time can you dedicate to your team each week?",
    placeholder: "e.g. A few hours per week",
    required: true,
  },
  {
    key: "howDidYouHearAboutSimSN",
    question: "How did you find out about SimSN?",
    placeholder: "e.g. Reddit, a friend, YouTube…",
    required: true,
  },
  {
    key: "communityReference",
    question: "Do you know anyone in the SimSN community?",
    hint: "Optional.",
    placeholder: "List any SimSN usernames",
    required: false,
  },
  {
    key: "aboutYourself",
    question: "Tell us a bit about yourself",
    placeholder:
      "What you're hoping to get out of SimSN, your sim sports background, why you picked this team…",
    required: true,
    long: true,
  },
];

export const vbEmptyAnswers: VbAnswerValues = {
  discordUsername: "",
  howMuchTimeAnswer: "",
  howDidYouHearAboutSimSN: "",
  communityReference: "",
  aboutYourself: "",
};

/** The answers as the API stores them: only questions that were answered. */
export const vbAnswersToSend = (
  values: Partial<VbAnswerValues>,
): VbRequestAnswer[] =>
  vbQuestions
    .filter((item) => values[item.key]?.trim())
    .map((item) => ({
      Question: item.question,
      Answer: values[item.key]!.trim(),
    }));

/** A stored application's answers, back in the form's fields. */
export const vbAnswersFrom = (answers?: VbRequestAnswer[]): VbAnswerValues => {
  const values = { ...vbEmptyAnswers };
  vbQuestions.forEach((item) => {
    const stored = answers?.find((answer) => answer.Question === item.question);
    if (stored) values[item.key] = stored.Answer;
  });
  return values;
};

export const vbAnswersComplete = (values: VbAnswerValues) =>
  vbQuestions.every((item) => !item.required || values[item.key].trim());

const fieldClass =
  "w-full rounded-lg border-0 bg-(--sport-surface-2) px-2 py-1.5 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent-primary)";

/** The questions as form fields. */
export const VbApplicationQuestions: FC<{
  values: VbAnswerValues;
  onChange: (values: VbAnswerValues) => void;
}> = ({ values, onChange }) => (
  <div className="space-y-3 p-3 text-left text-sm">
    {vbQuestions.map((item) => (
      <label key={item.key} className="block">
        <div className="mb-1 font-medium">
          {item.question}
          {item.required && <span className="ml-1 text-(--accent-error)">*</span>}
        </div>
        {item.hint && (
          <div className="mb-1 text-xs text-(--text-muted)">{item.hint}</div>
        )}
        {item.long ? (
          <textarea
            className={`${fieldClass} resize-y`}
            rows={4}
            value={values[item.key]}
            placeholder={item.placeholder}
            onChange={(event) =>
              onChange({ ...values, [item.key]: event.target.value })
            }
          />
        ) : (
          <input
            className={fieldClass}
            value={values[item.key]}
            placeholder={item.placeholder}
            onChange={(event) =>
              onChange({ ...values, [item.key]: event.target.value })
            }
          />
        )}
      </label>
    ))}
    <div className="text-xs text-(--text-muted)">
      <span className="text-(--accent-error)">*</span> Required.
    </div>
  </div>
);

/** Stored answers as a list, for the waiting application and the admin page. */
export const VbAnswerList: FC<{ answers?: VbRequestAnswer[] }> = ({
  answers,
}) =>
  answers?.length ? (
    <dl className="space-y-2 text-left text-sm">
      {answers.map((answer, index) => (
        <div key={index}>
          <dt className="text-xs uppercase text-(--text-muted)">
            {answer.Question}
          </dt>
          <dd className="whitespace-pre-wrap">{answer.Answer}</dd>
        </div>
      ))}
    </dl>
  ) : (
    <div className="text-left text-sm text-(--text-muted)">
      No answers were sent.
    </div>
  );
