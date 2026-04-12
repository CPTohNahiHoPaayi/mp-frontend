import { Heading, Box } from "@chakra-ui/react";

const HeadingBlock = ({
  level = 4,
  text,
  align = "left",
  margin = 6,
}) => {
  const sizeMap = {
    1: { fontSize: { base: "2xl", md: "3xl" }, color: "white" },
    2: { fontSize: { base: "xl", md: "2xl" }, color: "white" },
    3: { fontSize: { base: "lg", md: "xl" }, color: "gray.200" },
    4: { fontSize: { base: "md", md: "lg" }, color: "gray.200" },
    5: { fontSize: "md", color: "gray.300" },
    6: { fontSize: "sm", color: "gray.400" },
  };

  const config = sizeMap[level] || sizeMap[4];

  return (
    <Box w="full" mb={margin}>
      {level <= 2 && (
        <Box
          h="2px"
          w="40px"
          bg="linear-gradient(90deg, #00C9A7, #3B82F6)"
          rounded="full"
          mb={3}
        />
      )}
      <Heading
        as={`h${level}`}
        fontSize={config.fontSize}
        color={config.color}
        fontWeight={level <= 2 ? "800" : "700"}
        lineHeight="1.3"
        letterSpacing="-0.01em"
        textAlign={align}
        wordBreak="break-word"
      >
        {text}
      </Heading>
    </Box>
  );
};

export default HeadingBlock;
