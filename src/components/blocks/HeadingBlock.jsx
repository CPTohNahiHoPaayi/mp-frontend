import { Heading, HStack, Icon, Box } from "@chakra-ui/react";
import { BsStars } from "react-icons/bs";

const HeadingBlock = ({
  level = 4,
  text,
  color,
  align = "left",
  margin = 6,
  className = "",
  useGradient = true,
  showDivider = true,
}) => {
  const sizeMap = {
    1: ["4xl", "5xl"],
    2: ["3xl", "4xl"],
    3: ["2xl", "3xl"],
    4: ["xl", "2xl"],
    5: ["lg", "xl"],
    6: ["md", "lg"],
  };

  const colorOptions = [
    "#f9e2af", // yellow
    "#cba6f7", // mauve
    "#89b4fa", // blue
    "#f5c2e7", // pink
    "#fab387", // peach
    "#94e2d5", // teal
  ];

  const headingColor =
    color || colorOptions[Math.floor(Math.random() * colorOptions.length)];

  const gradient = "linear(to-r, #89b4fa, #cba6f7, #f5c2e7)"; // blue → mauve → pink

  return (
    <Box w="full" mb={margin} className={className}>
      {showDivider && (
        <Box
          as="hr"
          borderTop="2px solid"
          borderColor={headingColor}
          mb={3}
          opacity={0.5}
          w="100%"
        />
      )}

      <HStack
        spacing={3}
        align={align === "center" ? "center" : "flex-start"}
        justify={align}
      >
        <Icon
          as={BsStars}
          color={headingColor}
          boxSize={level <= 3 ? 6 : 5}
          mt="4px"
          flexShrink={0}
        />

        <Heading
          as={`h${level}`}
          fontSize={sizeMap[level] || ["md", "lg"]}
          bgGradient={useGradient ? gradient : undefined}
          bgClip={useGradient ? "text" : undefined}
          color={useGradient ? "white" : headingColor}
          fontWeight="extrabold"
          lineHeight="short"
          letterSpacing="-0.5px"
          textAlign={align}
          wordBreak="break-word"
        >
          {text}
        </Heading>
      </HStack>

      {showDivider && (
        <Box
          as="hr"
          borderTop="2px solid"
          borderColor={headingColor}
          mt={3}
          opacity={0.4}
          w="60%"
        />
      )}
    </Box>
  );
};

export default HeadingBlock;
