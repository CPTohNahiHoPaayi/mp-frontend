"use client";

import React, { useEffect, useState } from "react";
import { Box, Flex, Text, Button, useClipboard } from "@chakra-ui/react";
import { codeToHtml } from "shiki";
import { Copy, Check } from "lucide-react";

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
      my={5}
      rounded="xl"
      overflow="hidden"
      border="1px solid"
      borderColor="whiteAlpha.100"
      fontFamily="'Fira Code', 'JetBrains Mono', monospace"
    >
      <Flex
        justify="space-between"
        align="center"
        px={4}
        py={2}
        bg="rgba(255,255,255,0.03)"
        borderBottom="1px solid"
        borderColor="whiteAlpha.50"
      >
        <Text fontSize="xs" fontWeight="medium" color="gray.600" textTransform="uppercase" letterSpacing="wider">
          {language}
        </Text>
        <Button
          onClick={onCopy}
          size="xs"
          variant="ghost"
          color={hasCopied ? "#00C9A7" : "gray.500"}
          _hover={{ color: "white", bg: "whiteAlpha.50" }}
          rounded="lg"
          h={7}
          px={2}
        >
          {hasCopied ? <Check size={13} /> : <Copy size={13} />}
          <Text ml={1.5} fontSize="xs">{hasCopied ? "Copied" : "Copy"}</Text>
        </Button>
      </Flex>

      <Box
        p={4}
        overflowX="auto"
        bg="#0D0F17"
        className="shiki"
        sx={{
          "& pre": {
            padding: "0.25rem 0",
            margin: 0,
            bg: "transparent !important",
          },
          "& code": {
            fontSize: "0.85rem",
            lineHeight: "1.7",
          },
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Box>
  );
};

export default CodeBlock;
