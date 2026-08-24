"use client";
import { useEffect, useState } from "react";
import { Paper, Title, Text, Loader, Group, Center } from "@mantine/core";

interface AIResponderProps {
  query?: string; // Optional query from URL or parent component
}

export default function AIResponder({ query }: AIResponderProps) {
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResponse = async (msg: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: msg }] }), // Standardized for OpenAI
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResponse(data.response || ""); // Fallback to empty if no content
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Optional: Streaming version (uncomment for real-time typing effect)
  /*
  const fetchResponse = async (msg: string) => {
    // ... (setup)
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: msg }], stream: true }),
    });
    if (!res.body) throw new Error("No response body");
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      fullResponse += chunk;
      setResponse(fullResponse); // Update live
    }
    // ... (error handling)
  };
  */

  useEffect(() => {
    if (query && query.trim()) {
      fetchResponse(query);
    }
  }, [query]);

  if (!query) return null;

  return (
    <Paper shadow="md" w={"50vw"} p="md" withBorder radius="md" bg="gray.0">
      <Title order={3}  c="dark">
        AI Overview:
      </Title>
        <h3>
            About {query}
        </h3>
      {loading && (
        <Center>
          <Group>
            <Loader size="sm" />
            <Text size="sm" c="gray">
              Thinking...
            </Text>
          </Group>
        </Center>
      )}
      {error && <Text c="red" size="sm">{"No results found. Try adjusting your search."}</Text>}
      {!loading && !error && response && (
        <Text size="sm" c="dark" style={{ whiteSpace: "pre-wrap" }}>
          {response}
        </Text>
      )}
      {!loading && !error && !response && (
        <Text size="sm" c="gray" italic>
          No response generated.
        </Text>
      )}
    </Paper>
  );
}
