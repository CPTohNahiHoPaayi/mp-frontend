import React, { useState, useEffect } from 'react';
import {
    Box, Button, Center, Flex, Grid, Heading, IconButton, Input, Select, Spinner, Tag, Text,
} from '@chakra-ui/react';
import { Search, Heart, Eye, Filter, X, TrendingUp, Clock, FileText, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LandingPage from './LandingPage';
import { useNavigate } from 'react-router-dom';
import {
    Select as HeadlessSelect,
    Portal,
    createListCollection
} from "@chakra-ui/react"
import NoteCard from '../components/notes/NoteCard';

function Social() {
    const { isAuthenticated, token, user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [notes, setNotes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('COMBINED');
    const [sortBy, setSortBy] = useState('RELEVANCE');
    const [tags, setTags] = useState('');
    const [minLikes, setMinLikes] = useState('');
    const [maxLikes, setMaxLikes] = useState('');
    const [showFilters, setShowFilters] = useState(true);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('TRENDING');
    const [contentType, setContentType] = useState('COURSES');
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

    const fetchNotes = async (type) => {
        setLoading(true);
        setMode(type);
        try {
            let endpoint = '';
            if (type === 'TRENDING') endpoint = '/api/notes/popular?limit=50';
            if (type === 'RECENT') endpoint = '/api/notes/recent?limit=50';

            const res = await fetch(base_url + endpoint, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();

            const enriched = await Promise.all(data.map(async (note) => {
                try {
                    const likeRes = await fetch(`${base_url}/api/notes/${note.id}/${user.email}`);
                    const liked = await likeRes.json();
                    return { ...note, liked };
                } catch {
                    return { ...note, liked: false };
                }
            }));

            setNotes(enriched);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchContent = (type) => {
        if (contentType === 'COURSES') {
            fetchCourses(type);
        } else {
            fetchNotes(type);
        }
    };

    useEffect(() => {
        fetchContent('TRENDING');
    }, [token, contentType]);

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

    const handleNoteLike = async (noteId) => {
        const update = (list) =>
            list.map((n) => {
                if (n.id !== noteId) return n;

                const likedByList = (n.likedBy || '').split(',').map((email) => email.trim()).filter(Boolean);
                const alreadyLiked = likedByList.includes(user.email);

                const newLikedBy = alreadyLiked
                    ? likedByList.filter((email) => email !== user.email)
                    : [...likedByList, user.email];

                return {
                    ...n,
                    liked: !alreadyLiked,
                    likedBy: newLikedBy.join(','),
                    likesCount: alreadyLiked ? parseInt(n.likesCount) - 1 : parseInt(n.likesCount) + 1,
                };
            });

        setNotes(update);

        try {
            await fetch(`${base_url}/api/notes/${noteId}/like`, {
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

        const apiBase = contentType === 'COURSES' ? '/api/courses' : '/api/notes';

        try {
            const res = await fetch(`${base_url}${apiBase}/search/advanced?${params.toString()}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();

            const likeBase = contentType === 'COURSES' ? '/api/courses' : '/api/notes';
            const enriched = await Promise.all(data.map(async (item) => {
                try {
                    const likeRes = await fetch(`${base_url}${likeBase}/${item.id}/${user.email}`);
                    const liked = await likeRes.json();
                    return { ...item, liked };
                } catch {
                    return { ...item, liked: false };
                }
            }));

            if (contentType === 'COURSES') {
                setCourses(enriched);
            } else {
                setNotes(enriched);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const CourseCard = ({ course }) => {
        const tagsArray = (course.tags || '').split(',').filter(Boolean).slice(0, 2);
        const likedBy = (course.likedBy || '').split(',');
        return (
            <Box p={4} bg="rgba(255,255,255,0.02)" rounded="xl" shadow="md" _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }} transition="all 0.2s">
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
                    </Flex>
                    <Button colorScheme="blue" size="sm" onClick={() => navigate(`/courses/${course.id}/module/0/lesson/0`)}>
                        View Course
                    </Button>
                </Flex>
            </Box>
        );
    };

    if (!isAuthenticated()) return <LandingPage />;

    const contentLabel = contentType === 'COURSES' ? 'Courses' : 'Notes';

    return (
        <Box minH="100vh" bg="#06080F" py={10} px={4} color="white">
            <Center mb={10} flexDirection="column" textAlign="center" px={4}>
                <Heading
                    fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                    mb={4}
                    lineHeight="shorter"
                    letterSpacing="-0.5px"
                    fontWeight="800"
                    letterSpacing="-0.02em"
                    color="white"
                >
                    Discover <Box as="span" color="#00C9A7">{contentLabel}</Box>
                </Heading>
                <Text
                    color="gray.400"
                    fontSize={{ base: "md", md: "lg", lg: "xl" }}
                    maxW="2xl"
                    lineHeight="tall"
                    fontWeight="medium"
                >
                    {contentType === 'COURSES'
                        ? <>Find the perfect course to <Text as="span" color="blue.300" fontWeight="semibold">enhance your skills</Text> and expand your knowledge.</>
                        : <>Explore community <Text as="span" color="blue.300" fontWeight="semibold">notes and ideas</Text> shared by others.</>
                    }
                </Text>
            </Center>

            {/* Content Type Toggle */}
            <Flex justify="center" gap={2} mb={6}>
                <Button
                    onClick={() => setContentType('COURSES')}
                    variant={contentType === 'COURSES' ? 'solid' : 'outline'}
                    colorScheme="blue"
                    size="md"
                >
                    <BookOpen size={16} />
                    <Text ml={2}>Courses</Text>
                </Button>
                <Button
                    onClick={() => setContentType('NOTES')}
                    variant={contentType === 'NOTES' ? 'solid' : 'outline'}
                    colorScheme="blue"
                    size="md"
                >
                    <FileText size={16} />
                    <Text ml={2}>Notes</Text>
                </Button>
            </Flex>

            <Box maxW="4xl" mx="auto" mb={6}>
                {/* Search bar */}
                <Flex
                    align="center"
                    bg="rgba(255,255,255,0.03)"
                    border="1px solid"
                    borderColor="whiteAlpha.50"
                    rounded="full"
                    px={4}
                    py={1}
                    _focusWithin={{ borderColor: '#00C9A7', boxShadow: '0 0 0 1px rgba(0,201,167,0.2)' }}
                    transition="all 0.2s"
                >
                    <Search size={14} color="rgba(255,255,255,0.2)" />
                    <input
                        placeholder={`Search ${contentLabel.toLowerCase()}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: 'white',
                          fontSize: '14px',
                          height: '32px',
                          flex: 1,
                          marginLeft: '8px',
                          caretColor: '#00C9A7',
                        }}
                    />
                    <IconButton
                        aria-label="Filter"
                        onClick={() => setShowFilters(!showFilters)}
                        variant="ghost"
                        size="xs"
                        rounded="full"
                        color={showFilters ? '#00C9A7' : '#555'}
                        _hover={{ color: 'white' }}
                    >
                    <Filter size={14} />
                    </IconButton>
                </Flex>

                {/* Mode Buttons */}
                <Flex justify="center" gap={4} mt={4}>
                    <Button
                        onClick={() => fetchContent('TRENDING')}
                        variant={mode === 'TRENDING' ? 'solid' : 'outline'}
                        colorScheme="blue"
                    >
                        Trending
                    </Button>
                    <Button
                        onClick={() => fetchContent('RECENT')}
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
                    <Box mt={6} p={6} bg="rgba(255,255,255,0.02)" rounded="2xl" shadow="md" border="1px solid" borderColor="whiteAlpha.100">
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
                                        backgroundColor: 'rgba(255,255,255,0.04)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.1)',
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
                                        backgroundColor: 'rgba(255,255,255,0.04)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.1)',
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
                                    bg="rgba(255,255,255,0.04)"
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
                                        bg="rgba(255,255,255,0.04)"
                                        color="white"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={maxLikes}
                                        onChange={(e) => setMaxLikes(e.target.value)}
                                        bg="rgba(255,255,255,0.04)"
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

            {/* Content List */}
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
                                <Text ml={3}>Trending {contentLabel}</Text>
                            </Flex>
                        )}
                        {mode === 'RECENT' && (
                            <Flex align="center">
                                <Clock size={24} />
                                <Text ml={3}>Recently Added {contentLabel}</Text>
                            </Flex>
                        )}
                        {mode === 'SEARCH' && (
                            <Text>Search Results ({contentType === 'COURSES' ? courses.length : notes.length})</Text>
                        )}
                    </Heading>

                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr', lg: 'repeat(3, 1fr)' }} gap={6}>
                        {contentType === 'COURSES'
                            ? courses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))
                            : notes.map((note) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    user={user}
                                    onLike={handleNoteLike}
                                    showActions={false}
                                />
                            ))
                        }
                    </Grid>
                </Box>
            )}
        </Box>
    );
}

export default Social;
