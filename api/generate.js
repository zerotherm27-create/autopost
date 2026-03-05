{\rtf1\ansi\ansicpg1252\cocoartf2761
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx566\tx1133\tx1700\tx2267\tx2834\tx3401\tx3968\tx4535\tx5102\tx5669\tx6236\tx6803\pardirnatural\partightenfactor0

\f0\fs24 \cf0  module.exports = async function handler(req, res) \{\
  res.setHeader("Access-Control-Allow-Origin", "*");\
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");\
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");\
\
  if (req.method === "OPTIONS") return res.status(200).end();\
  if (req.method !== "POST") return res.status(405).json(\{ error: "Method not allowed" \});\
\
  const \{ messages, max_tokens = 1024 \} = req.body;\
  if (!messages) return res.status(400).json(\{ error: "messages required" \});\
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json(\{ error: "ANTHROPIC_API_KEY not set" \});\
\
  try \{\
    const response = await fetch("https://api.anthropic.com/v1/messages", \{\
      method: "POST",\
      headers: \{\
        "Content-Type": "application/json",\
        "x-api-key": process.env.ANTHROPIC_API_KEY,\
        "anthropic-version": "2023-06-01",\
      \},\
      body: JSON.stringify(\{ model: "claude-sonnet-4-20250514", max_tokens, messages \}),\
    \});\
    const data = await response.json();\
    return res.status(200).json(data);\
  \} catch (e) \{\
    return res.status(500).json(\{ error: "Server error" \});\
  \}\
\};}