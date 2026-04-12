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
      borderColor="var(--border-base)"
      fontFamily="'Fira Code', 'JetBrains Mono', monospace"
      bg="#0C0F1A"
    >
      {/* Header bar with colored accent */}
      <Flex
        justify="space-between"
        align="center"
        px={4}
        py={2}
        bg="linear-gradient(90deg, rgba(var(--blue-rgb),0.08), rgba(var(--purple-rgb),0.05))"
        borderBottom="1px solid"
        borderColor="var(--border-base)"
      >
        <Flex align="center" gap={2}>
          <Terminal size={13} color="var(--blue-light)" />
          <Text fontSize="xs" fontWeight="600" color="var(--blue-light)" textTransform="uppercase" letterSpacing="0.06em">
            {language}
          </Text>
        </Flex>
        <Button
          onClick={onCopy}
          size="xs"
          variant="ghost"
          color={hasCopied ? "var(--accent)" : "#4A5568"}
          _hover={{ color: "#A0AEC0", bg: "var(--bg-input)" }}
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
      <Flex px={4} py={1.5} borderTop="1px solid" borderColor="var(--border-base)" justify="flex-end">
        <Text fontSize="xs" color="#2D3748">
          {code.split('\n').length} lines
        </Text>
      </Flex>
    </Box>
  );
};

export default CodeBlock;
