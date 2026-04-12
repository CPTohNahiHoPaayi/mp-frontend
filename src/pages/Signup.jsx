import {
    Flex,
    Box,
    Input,
    Button,
    Heading,
    Text,
    Link,
    Stack,
  } from "@chakra-ui/react";
  import { useNavigate } from "react-router-dom";
  import { useState } from "react";
  
  export function Signup() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const navigate = useNavigate();
  
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#0D0D0D">
        <Box
          bg="#1E1E1E"
          p={8}
          rounded="lg"
          boxShadow="lg"
          w="full"
          maxW="md"
        >
          <Stack spacing={6}>
            <Heading fontSize="2xl" color="var(--text-primary)" textAlign="center">
              Create your account
            </Heading>
  
            <Box>
              <Text mb={1} color="var(--text-body)">
                Name
              </Text>
              <Input
                type="text"
                bg="#2D2D2D"
                border="1px solid #3D3D3D"
                color="var(--text-primary)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                _placeholder={{ color: "var(--text-muted)" }}
              />
            </Box>
  
            <Box>
              <Text mb={1} color="var(--text-body)">
                Email address
              </Text>
              <Input
                type="email"
                bg="#2D2D2D"
                border="1px solid #3D3D3D"
                color="var(--text-primary)"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                _placeholder={{ color: "var(--text-muted)" }}
              />
            </Box>
  
            <Box>
              <Text mb={1} color="var(--text-body)">
                Password
              </Text>
              <Input
                type="password"
                bg="#2D2D2D"
                border="1px solid #3D3D3D"
                color="var(--text-primary)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                _placeholder={{ color: "var(--text-muted)" }}
              />
            </Box>
  
            <Stack spacing={5}>
              <Button
                bg="#3B82F6"
                color="var(--text-primary)"
                _hover={{ bg: "#2563EB" }}
                onClick={() => navigate("/signin")}
              >
                Sign up
              </Button>
              <Text textAlign="center" color="var(--text-secondary)">
                Already have an account?{" "}
                <Link color="var(--blue-light)" onClick={() => navigate("/signin")}>
                  Sign in
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Flex>
    );
  }
  