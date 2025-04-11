from openai import OpenAI

client = OpenAI(
  api_key="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"
)

completion = client.chat.completions.create(
  model="gpt-4o-mini",
  store=True,
  messages=[
    {"role": "user", "content": "write a haiku about ai"}
  ]
)

print(completion.choices[0].message);
