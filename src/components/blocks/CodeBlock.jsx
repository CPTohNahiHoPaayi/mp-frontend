"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  useClipboard,
} from "@chakra-ui/react";
import { codeToHtml } from "shiki";
import { toaster } from "@/components/ui/toaster"; // ✅ custom toaster

const themes = [
  "vitesse-dark",
  "nord",
  "github-dark",
  "github-light",
  "rose-pine",
  "poimandres",
  "slack-dark",
  "catppuccin-mocha",
  "dracula",
];

const CodeBlock = ({ code = "", language = "javascript" }) => {
  const [html, setHtml] = useState("");
  const { hasCopied, onCopy } = useClipboard(code);
  const [theme] = useState(themes[7]);

  useEffect(() => {
    const highlight = async () => {
      const htmlResult = await codeToHtml(code, {
        lang: language,
        theme,
      });
      setHtml(htmlResult);
    };
    highlight();
  }, [code, language, theme]);

  const handleCopy = () => {
    onCopy();
    toaster.create({
      title: "Copied!",
      type: "success",
    });
  };

  return (
    <Box
      my={6}
      borderRadius="lg"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.700"
      fontFamily="Fira Code, monospace"
    >
      <Flex
        justify="space-between"
        align="center"
        px={4}
        py={2}
        bg="#1e1e1e"
        borderBottom="1px solid"
        borderColor="gray.700"
      >
        <Text
          fontSize="sm"
          fontWeight="medium"
          color="gray.400"
          textTransform="uppercase"
        >
          {language} / {theme}
        </Text>
        <Button
          onClick={handleCopy}
          size="xs"
          variant="ghost"
          fontSize="xs"
          color="gray.300"
          _hover={{ color: "white", bg: "gray.700" }}
        >
          {hasCopied ? "✓ Copied" : "📋 Copy"}
        </Button>
      </Flex>

      <Box
        p={4}
        overflowX="auto"
        background="#1e1e1e"
        className="shiki"
        sx={{
          '& pre': {
            padding: '0.5rem 0',
          },
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Box>
  );
};

export default CodeBlock;
