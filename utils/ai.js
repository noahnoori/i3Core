const fetch = global.fetch || require('node-fetch');

exports.summarizeAndSentiment = async function (text) {
  if (!process.env.OPENAI_API_KEY) return { summary: text.slice(0,200), sentiment: null };
  const prompt = `You are a helpful assistant. Summarize the following internal feedback in one short paragraph (max 40 words). Then return an explicit sentiment label: Positive, Neutral or Negative. Respond as JSON with keys \"summary\" and \"sentiment\".\n\nFeedback:\n"""
${text}
"""`;

  const body = {
    model: 'gpt-3.5-turbo',
    messages: [{role:'system',content:'You will output only JSON.'},{role:'user',content:prompt}],
    max_tokens:200,
    temperature:0.2
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method:'POST', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify(body)
  });
  const j = await res.json();
  try {
    const txt = j.choices[0].message.content.trim();
    // Try to parse JSON
    const parsed = JSON.parse(txt);
    return { summary: parsed.summary, sentiment: parsed.sentiment };
  } catch (err) {
    // Fallback: return first 200 chars
    return { summary: text.slice(0,200), sentiment: null };
  }
};
