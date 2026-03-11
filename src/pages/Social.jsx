import React, { useState, useEffect } from 'react';
import {
    Box, Button, Center, Flex, Grid, Heading, IconButton, Input, Select, Spinner, Tag, Text,
} from '@chakra-ui/react';
import { Search, Heart, Eye, Filter, X, TrendingUp, Clock, TestTube } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LandingPage from './LandingPage';
import { useNavigate } from 'react-router-dom';
import {
    Select as HeadlessSelect,
    Portal,
    createListCollection
} from "@chakra-ui/react"

function Social() {
    const { isAuthenticated, token, user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('COMBINED');
    const [sortBy, setSortBy] = useState('RELEVANCE');
    const [tags, setTags] = useState('');
    const [minLikes, setMinLikes] = useState('');
    const [maxLikes, setMaxLikes] = useState('');
    const [showFilters, setShowFilters] = useState(true);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('TRENDING'); // TRENDING | RECENT | SEARCH
    const base_url = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();


    const sortOptions = createListCollection({
        items: [
            { label: "Relevance", value: "RELEVANCE" },
            { label: "Most Liked", value: "LIKES_DESC" },
            { label: "Least Liked", value: "LIKES_ASC" },
            { label: "Title A-Z", value: "TITLE_ASC" },
            { label: "Title Z-A", value: "TITLE_DESC" },
            { label: "Newest", value: "CREATED_DESC" },
            { label: "Oldest", value: "CREATED_ASC" },
        ],
    })
    const searchTypes = createListCollection({
        items: [
            { label: "Smart", value: "COMBINED" },
            { label: "Exact", value: "EXACT" },
            { label: "Fuzzy", value: "FUZZY" },
            { label: "Prefix", value: "PREFIX" },
            { label: "Wildcard", value: "WILDCARD" },
        ],
    });
    const fetchCourses = async (type) => {
        setLoading(true);
        setMode(type);
        try {
            let endpoint = '';
            if (type === 'TRENDING') endpoint = '/api/courses/popular?limit=50';
            if (type === 'RECENT') endpoint = '/api/courses/recent?limit=50';

            const res = await fetch(base_url + endpoint, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();

            const enriched = await Promise.all(data.map(async (course) => {
                try {
                    const likeRes = await fetch(`${base_url}/api/courses/${course.id}/${user.email}`);
                    const liked = await likeRes.json();
                    return { ...course, liked };
                } catch {
                    return { ...course, liked: false };
                }
            }));

            setCourses(enriched);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses('TRENDING');
    }, [token]);

    const handleLike = async (courseId) => {
        const update = (list) =>
            list.map((c) => {
                if (c.id !== courseId) return c;

                const likedByList = (c.likedBy || '').split(',').map((email) => email.trim()).filter(Boolean);
                const alreadyLiked = likedByList.includes(user.email);

                const newLikedBy = alreadyLiked
                    ? likedByList.filter((email) => email !== user.email)
                    : [...likedByList, user.email];

                return {
                    ...c,
                    liked: !alreadyLiked,
                    likedBy: newLikedBy.join(','),
                    likesCount: alreadyLiked ? parseInt(c.likesCount) - 1 : parseInt(c.likesCount) + 1,
                };
            });

        setCourses(update);

        try {
            await fetch(`${base_url}/api/courses/${courseId}/like`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (err) {
            console.error(err);
        }
    };


    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        setMode('SEARCH');

        const params = new URLSearchParams({
            q: searchQuery,
            type: searchType,
            sort: sortBy,
            limit: 50,
            offset: 0,
        });

        if (tags) params.append('tags', tags);
        if (minLikes) params.append('minLikes', minLikes);
        if (maxLikes) params.append('maxLikes', maxLikes);

        try {
            const res = await fetch(`${base_url}/api/courses/search/advanced?${params.toString()}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();

            const enriched = await Promise.all(data.map(async (course) => {
                try {
                    const likeRes = await fetch(`${base_url}/api/courses/${course.id}/${user.email}`);
                    const liked = await likeRes.json();
                    return { ...course, liked };
                } catch {
                    return { ...course, liked: false };
                }
            }));

            setCourses(enriched);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const CourseCard = ({ course }) => {
        // console.log(course);
        const tagsArray = (course.tags || '').split(',').filter(Boolean).slice(0, 2);
        const likedBy = (course.likedBy || '').split(',');
        // console.log(user);
        // console.log(likedBy);
        // return <>{course.title}</>
        return (
            <Box p={4} bg="gray.800" rounded="xl" shadow="md" _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }} transition="all 0.2s">
                <Box h="150px" bgGradient="linear(to-br, blue.500, pink.500)" rounded="lg" position="relative">
                    <Center position="absolute" inset={0} bg="blackAlpha.300">
                        <Heading size="md" color="white" textAlign="center">{course.title}</Heading>
                    </Center>
                </Box>
                <Flex justify="space-between" align="center" mt={4}>
                    <Text fontSize="sm" color="gray.400">By {course.creator || 'Anonymous'}</Text>
                    <Flex gap={2} wrap="wrap">
                        {tagsArray.map((tag, i) => (
                            <Tag.Root
                                key={i}
                                colorPalette="blue"
                                size="sm"
                                variant="solid"
                                className="mr-2 mb-2"
                            >
                                <Tag.Label>{tag}</Tag.Label>
                            </Tag.Root>
                        ))}

                    </Flex>
                </Flex>
                <Flex justify="space-between" align="center" mt={4}>
                    <Flex gap={4} align="center">
                        <Button size="lg" variant="ghost" colorScheme={course.liked ? 'red' : 'gray'} onClick={() => handleLike(course.id)}>
                            <Heart size={24} fill={likedBy.includes(user.email) == true ? 'red' : 'none'} stroke={likedBy.includes(user.email) == true ? 'red' : 'white'} />
                            
                            {course.likesCount}
                        </Button>

                        {/* <Flex align="center" gap={1} color="gray.400">
                            <Eye size={16} />
                            <Text fontSize="sm">{course.views || 0}</Text>
                        </Flex> */}
                    </Flex>
                    <Button colorScheme="blue" size="sm" onClick={() => navigate(`/courses/${course.id}/module/0/lesson/0`)}>
                        View Course
                    </Button>
                </Flex>
            </Box>
        );
    };

    if (!isAuthenticated()) return <LandingPage />;

    return (
        <Box minH="100vh" bg="gray.900" py={10} px={4} color="white">
            <Center mb={16} flexDirection="column" textAlign="center" px={4}>
                <Heading
                    fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                    mb={4}
                    lineHeight="shorter"
                    letterSpacing="-0.5px"
                    bg="linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)"
                    bgClip="text"
                    fontWeight="extrabold"
                >
                    Discover Courses
                </Heading>
                <Text
                    color="gray.400"
                    fontSize={{ base: "md", md: "lg", lg: "xl" }}
                    maxW="2xl"
                    lineHeight="tall"
                    fontWeight="medium"
                >
                    Find the perfect course to <Text as="span" color="blue.300" fontWeight="semibold">enhance your skills</Text> and expand your knowledge in any domain.
                </Text>
            </Center>



            <Box maxW="4xl" mx="auto" mb={6}>
                {/* Search bar */}
                <Flex
                    bg="gray.800"
                    border="1px solid"
                    borderColor="gray.700"
                    borderRadius="2xl"
                    align="center"
                    px={4}
                    py={3}
                >
                    <Search size={20} color="gray" />
                    <Input
                        variant="unstyled"
                        placeholder="Search for courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        ml={3}
                        flex={1}
                        color="white"
                        _placeholder={{ color: 'gray.500' }}
                    />
                    <IconButton
                        aria-label="Filter"
                        onClick={() => setShowFilters(!showFilters)}
                        variant={showFilters ? 'solid' : 'ghost'}
                        colorScheme="blue"
                        size="sm"
                        
                    >
                    <Filter size={20} />
                    </IconButton>
                </Flex>

                {/* Mode Buttons */}
                <Flex justify="center" gap={4} mt={4}>
                    <Button
                        onClick={() => fetchCourses('TRENDING')}
                        variant={mode === 'TRENDING' ? 'solid' : 'outline'}
                        colorScheme="blue"
                    >
                        Trending
                    </Button>
                    <Button
                        onClick={() => fetchCourses('RECENT')}
                        variant={mode === 'RECENT' ? 'solid' : 'outline'}
                        colorScheme="blue"
                    >
                        Recent
                    </Button>
                    <Button
                        onClick={handleSearch}
                        variant={mode === 'SEARCH' ? 'solid' : 'outline'}
                        colorScheme="blue"
                    >
                        Search
                    </Button>
                </Flex>

                {/* Filters */}
                {showFilters && (
                    <Box mt={6} p={6} bg="gray.800" rounded="2xl" shadow="md" border="1px solid" borderColor="gray.700">
                        <Flex justify="space-between" align="center" mb={4}>
                            <Text fontSize="lg" fontWeight="bold">Filters</Text>
                            <IconButton
                                size="sm"
                                variant="ghost"
                                aria-label="Close"
                                icon={<X />}
                                onClick={() => setShowFilters(false)}
                            />
                        </Flex>

                        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                            {/* Search Type */}
                            <Box>
                                <Text mb={1}>Search Type</Text>
                                <select
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        backgroundColor: '#2D3748',
                                        color: 'white',
                                        border: '1px solid #4A5568',
                                        fontSize: '14px',
                                    }}
                                >
                                    {searchTypes.items.map((item) => (
                                        <option key={item.value} value={item.value}>{item.label}</option>
                                    ))}
                                </select>
                            </Box>

                            {/* Sort By */}
                            <Box>
                                <Text mb={1}>Sort By</Text>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        backgroundColor: '#2D3748',
                                        color: 'white',
                                        border: '1px solid #4A5568',
                                        fontSize: '14px',
                                    }}
                                >
                                    {sortOptions.items.map((item) => (
                                        <option key={item.value} value={item.value}>{item.label}</option>
                                    ))}
                                </select>
                            </Box>

                            {/* Tags Input */}
                            <Box>
                                <Text mb={1}>Tags</Text>
                                <Input
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="e.g. java,web"
                                    bg="gray.700"
                                    color="white"
                                />
                            </Box>

                            {/* Likes Range */}
                            <Box>
                                <Text mb={1}>Likes Range</Text>
                                <Flex gap={2}>
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={minLikes}
                                        onChange={(e) => setMinLikes(e.target.value)}
                                        bg="gray.700"
                                        color="white"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={maxLikes}
                                        onChange={(e) => setMaxLikes(e.target.value)}
                                        bg="gray.700"
                                        color="white"
                                    />
                                </Flex>
                            </Box>
                        </Grid>

                        <Flex justify="flex-end" mt={6}>
                            <Button colorScheme="blue" onClick={handleSearch}>Apply Filters</Button>
                        </Flex>
                    </Box>
                )}
            </Box>

            {/* Course List */}
            {loading ? (
                <Center py={12}>
                    <Spinner size="lg" color="blue.300" />
                    <Text ml={4}>Loading...</Text>
                </Center>
            ) : (
                <Box mb={12}>
                    <Heading size="lg" mb={6}>
                        {mode === 'TRENDING' && (
                            <Flex align="center">
                                <TrendingUp size={24} />
                                <Text ml={3}>Trending Courses</Text>
                            </Flex>
                        )}
                        {mode === 'RECENT' && (
                            <Flex align="center">
                                <Clock size={24} />
                                <Text ml={3}>Recently Added</Text>
                            </Flex>
                        )}
                        {mode === 'SEARCH' && <Text>Search Results ({courses.length})</Text>}
                    </Heading>

                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr', lg: 'repeat(3, 1fr)' }} gap={6}>
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
}

export default Social;
