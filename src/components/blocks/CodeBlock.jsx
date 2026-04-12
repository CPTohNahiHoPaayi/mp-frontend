"use client";

import React, { useEffect, useState } from "react";
import { Box, Flex, Text, Button, useClipboard } from "@chakra-ui/react";
import { codeToHtml } from "shiki";
import { Copy, Check, Terminal } from "lucide-react";

const CodeBlock = ({ code = "", language = "javascript" }) => {
  const [html, setHtml] = useState("");
  const { hasCopied, onCopy } = useClipboard(code);

  useEffect(() => {
    const highlight = async () => {
      try {
        const htmlResult = await codeToHtml(code, {
          lang: language,
          theme: "catppuccin-mocha",
        });
        setHtml(htmlResult);
      } catch {
        setHtml(`<pre>${code}</pre>`);
      }
    };
    highlight();
  }, [code, language]);

  return (
    <Box
      my={6}
      rounded="xl"
      overflow="hidden"
      border="1px solid"
      borderColor="#1E2536"
      fontFamily="'Fira Code', 'JetBrains Mono', monospace"
      bg="#0C0F1A"
    >
      {/* Header bar with colored accent */}
      <Flex
        justify="space-between"
        align="center"
        px={4}
        py={2}
        bg="linear-gradient(90deg, rgba(59,130,246,0.08), rgba(124,58,237,0.05))"
        borderBottom="1px solid"
        borderColor="#1E2536"
      >
        <Flex align="center" gap={2}>
          <Terminal size={13} color="#60A5FA" />
          <Text fontSize="xs" fontWeight="600" color="#60A5FA" textTransform="uppercase" letterSpacing="0.06em">
            {language}
          </Text>
        </Flex>
        <Button
          onClick={onCopy}
          size="xs"
          variant="ghost"
          color={hasCopied ? "#00C9A7" : "#4A5568"}
          _hover={{ color: "#A0AEC0", bg: "rgba(255,255,255,0.04)" }}
          rounded="lg"
          h={6}
          px={2}
        >
          {hasCopied ? <Check size={12} /> : <Copy size={12} />}
          <Text ml={1} fontSize="xs">{hasCopied ? "Copied" : "Copy"}</Text>
        </Button>
      </Flex>

      {/* Code content */}
      <Box
        px={4}
        py={4}
        overflowX="auto"
        className="shiki"
        sx={{
          "& pre": {
            padding: "0.25rem 0",
            margin: 0,
            bg: "transparent !important",
          },
          "& code": {
            fontSize: "0.85rem",
            lineHeight: "1.75",
          },
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Bottom line count */}
      <Flex px={4} py={1.5} borderTop="1px solid" borderColor="#1E2536" justify="flex-end">
        <Text fontSize="xs" color="#2D3748">
          {code.split('\n').length} lines
        </Text>
      </Flex>
    </Box>
  );
};

export default CodeBlock;
