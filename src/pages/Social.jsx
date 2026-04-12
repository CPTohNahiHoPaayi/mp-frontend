import React, { useState, useEffect } from 'react';
import {
    Box, Button, Center, Flex, Grid, Heading, IconButton, Input, Spinner, Text,
} from '@chakra-ui/react';
import { Search, Heart, Filter, X, TrendingUp, Clock, FileText, BookOpen, Globe, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LandingPage from './LandingPage';
import { useNavigate } from 'react-router-dom';
import { createListCollection } from "@chakra-ui/react";
import NoteCard from '../components/notes/NoteCard';

const GRADIENT_PALETTES = [
    ['#0F2027', '#203A43', '#2C5364'],
    ['#141E30', '#243B55', '#2A5298'],
    ['#0D1117', '#1A1A2E', '#16213E'],
    ['#1A1A2E', '#16213E', '#0F3460'],
    ['#0C0C1D', '#1B1B3A', '#2D2D5E'],
];

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
    const [showFilters, setShowFilters] = useState(false);
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
    });
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
        if (contentType === 'COURSES') fetchCourses(type);
        else fetchNotes(type);
    };

    useEffect(() => {
        fetchContent('TRENDING');
    }, [token, contentType]);

    const handleLike = async (courseId) => {
        const update = (list) =>
            list.map((c) => {
                if (c.id !== courseId) return c;
                const likedByList = (c.likedBy || '').split(',').map((e) => e.trim()).filter(Boolean);
                const alreadyLiked = likedByList.includes(user.email);
                const newLikedBy = alreadyLiked ? likedByList.filter((e) => e !== user.email) : [...likedByList, user.email];
                return { ...c, liked: !alreadyLiked, likedBy: newLikedBy.join(','), likesCount: alreadyLiked ? parseInt(c.likesCount) - 1 : parseInt(c.likesCount) + 1 };
            });
        setCourses(update);
        try {
            await fetch(`${base_url}/api/courses/${courseId}/like`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
        } catch (err) { console.error(err); }
    };

    const handleNoteLike = async (noteId) => {
        const update = (list) =>
            list.map((n) => {
                if (n.id !== noteId) return n;
                const likedByList = (n.likedBy || '').split(',').map((e) => e.trim()).filter(Boolean);
                const alreadyLiked = likedByList.includes(user.email);
                const newLikedBy = alreadyLiked ? likedByList.filter((e) => e !== user.email) : [...likedByList, user.email];
                return { ...n, liked: !alreadyLiked, likedBy: newLikedBy.join(','), likesCount: alreadyLiked ? parseInt(n.likesCount) - 1 : parseInt(n.likesCount) + 1 };
            });
        setNotes(update);
        try {
            await fetch(`${base_url}/api/notes/${noteId}/like`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
        } catch (err) { console.error(err); }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        setMode('SEARCH');
        const params = new URLSearchParams({ q: searchQuery, type: searchType, sort: sortBy, limit: 50, offset: 0 });
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
                try { const r = await fetch(`${base_url}${likeBase}/${item.id}/${user.email}`); return { ...item, liked: await r.json() }; }
                catch { return { ...item, liked: false }; }
            }));
            if (contentType === 'COURSES') setCourses(enriched); else setNotes(enriched);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const CourseCard = ({ course, index }) => {
        const tagsArray = (course.tags || '').split(',').filter(Boolean).slice(0, 3);
        const likedBy = (course.likedBy || '').split(',');
        const isLiked = likedBy.includes(user.email);
        const palette = GRADIENT_PALETTES[index % GRADIENT_PALETTES.length];

        return (
            <Box
                bg="rgba(255,255,255,0.02)"
                border="1px solid"
                borderColor="whiteAlpha.50"
                rounded="2xl"
                overflow="hidden"
                _hover={{ borderColor: 'whiteAlpha.200', transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}
                transition="all 0.3s ease"
                cursor="pointer"
                onClick={() => navigate(`/courses/${course.id}/module/0/lesson/0`)}
                h="full"
                display="flex"
                flexDirection="column"
            >
                {/* Header gradient */}
                <Box
                    h="120px"
                    bg={`linear-gradient(135deg, ${palette[0]}, ${palette[1]}, ${palette[2]})`}
                    position="relative"
                    display="flex"
                    alignItems="flex-end"
                    p={4}
                >
                    <Box
                        position="absolute"
                        top={3}
                        right={3}
                        bg="rgba(0,0,0,0.4)"
                        backdropFilter="blur(8px)"
                        rounded="full"
                        px={2.5}
                        py={1}
                        display="flex"
                        alignItems="center"
                        gap={1.5}
                    >
                        <Heart size={12} fill={isLiked ? '#EF4444' : 'none'} stroke={isLiked ? '#EF4444' : 'white'} />
                        <Text fontSize="xs" fontWeight="600" color="white">{course.likesCount || 0}</Text>
                    </Box>
                    <Text
                        fontSize="lg"
                        fontWeight="700"
                        color="white"
                        lineHeight="1.3"
                        noOfLines={2}
                        textShadow="0 2px 8px rgba(0,0,0,0.5)"
                    >
                        {course.title}
                    </Text>
                </Box>

                {/* Body */}
                <Box p={4} flex={1} display="flex" flexDirection="column">
                    <Flex align="center" justify="space-between" mb={3}>
                        <Text fontSize="xs" color="#718096">
                            by <Text as="span" color="#A0AEC0" fontWeight="500">{course.creator || 'Anonymous'}</Text>
                        </Text>
                    </Flex>

                    {tagsArray.length > 0 && (
                        <Flex gap={1.5} flexWrap="wrap" mb={3}>
                            {tagsArray.map((tag, i) => (
                                <Box
                                    key={i}
                                    px={2}
                                    py={0.5}
                                    rounded="md"
                                    bg="rgba(59,130,246,0.08)"
                                    border="1px solid"
                                    borderColor="rgba(59,130,246,0.15)"
                                >
                                    <Text fontSize="2xs" color="#60A5FA" fontWeight="500">{tag.trim()}</Text>
                                </Box>
                            ))}
                        </Flex>
                    )}

                    <Flex align="center" justify="space-between" mt="auto">
                        <Button
                            size="xs"
                            variant="ghost"
                            color={isLiked ? '#EF4444' : '#4A5568'}
                            _hover={{ color: isLiked ? '#F87171' : '#A0AEC0', bg: 'rgba(255,255,255,0.04)' }}
                            rounded="lg"
                            h={7}
                            px={2}
                            onClick={(e) => { e.stopPropagation(); handleLike(course.id); }}
                        >
                            <Heart size={13} fill={isLiked ? 'currentColor' : 'none'} />
                            <Text ml={1} fontSize="xs">{isLiked ? 'Liked' : 'Like'}</Text>
                        </Button>

                        <Button
                            size="xs"
                            bg="rgba(0,201,167,0.08)"
                            color="#00C9A7"
                            border="1px solid"
                            borderColor="rgba(0,201,167,0.15)"
                            _hover={{ bg: 'rgba(0,201,167,0.15)' }}
                            rounded="lg"
                            h={7}
                            px={3}
                            onClick={(e) => { e.stopPropagation(); navigate(`/courses/${course.id}/module/0/lesson/0`); }}
                        >
                            <Text fontSize="xs" fontWeight="600">Open</Text>
                        </Button>
                    </Flex>
                </Box>
            </Box>
        );
    };

    if (!isAuthenticated()) return <LandingPage />;

    const contentLabel = contentType === 'COURSES' ? 'Courses' : 'Notes';
    const items = contentType === 'COURSES' ? courses : notes;

    const selectStyle = {
        width: '100%',
        padding: '8px 12px',
        borderRadius: '10px',
        backgroundColor: 'rgba(255,255,255,0.04)',
        color: '#A0AEC0',
        border: '1px solid rgba(255,255,255,0.06)',
        fontSize: '13px',
        outline: 'none',
    };

    return (
        <Box minH="full" bg="#06080F" py={8} px={4} color="white">
            <Box maxW="5xl" mx="auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Flex align="center" gap={3} mb={8}>
                        <Box w={10} h={10} rounded="xl" bg="rgba(0,201,167,0.08)" display="flex" alignItems="center" justifyContent="center">
                            <Globe size={20} color="#00C9A7" />
                        </Box>
                        <Box flex={1}>
                            <Heading fontSize={{ base: 'xl', md: '2xl' }} fontWeight="700" color="#E2E8F0" letterSpacing="-0.01em">
                                Discover
                            </Heading>
                            <Text fontSize="sm" color="#718096">
                                Explore what the community is building
                            </Text>
                        </Box>
                    </Flex>
                </motion.div>

                {/* Unified toolbar */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
                <Box
                    p={3}
                    mb={6}
                    bg="rgba(255,255,255,0.02)"
                    border="1px solid"
                    borderColor="whiteAlpha.50"
                    rounded="2xl"
                >
                    <Flex gap={2} align="center" wrap="wrap">
                        {/* Content type toggle */}
                        <Flex
                            bg="rgba(255,255,255,0.04)"
                            rounded="xl"
                            p={0.5}
                            gap={0.5}
                        >
                            {[
                                { key: 'COURSES', icon: BookOpen, label: 'Courses' },
                                { key: 'NOTES', icon: FileText, label: 'Notes' },
                            ].map(({ key, icon: Icon, label }) => (
                                <Button
                                    key={key}
                                    size="xs"
                                    onClick={() => setContentType(key)}
                                    bg={contentType === key ? 'rgba(0,201,167,0.12)' : 'transparent'}
                                    color={contentType === key ? '#00C9A7' : '#4A5568'}
                                    _hover={{ color: contentType === key ? '#00C9A7' : '#A0AEC0' }}
                                    rounded="lg"
                                    h={8}
                                    px={3}
                                    fontWeight={contentType === key ? '600' : '400'}
                                >
                                    <Icon size={13} />
                                    <Text ml={1.5} fontSize="xs">{label}</Text>
                                </Button>
                            ))}
                        </Flex>

                        <Box w="1px" h={6} bg="whiteAlpha.100" />

                        {/* Mode pills */}
                        <Flex gap={1}>
                            {[
                                { key: 'TRENDING', icon: TrendingUp, label: 'Trending' },
                                { key: 'RECENT', icon: Clock, label: 'Recent' },
                            ].map(({ key, icon: Icon, label }) => (
                                <Button
                                    key={key}
                                    size="xs"
                                    onClick={() => fetchContent(key)}
                                    bg={mode === key ? 'rgba(59,130,246,0.1)' : 'transparent'}
                                    color={mode === key ? '#60A5FA' : '#4A5568'}
                                    border="1px solid"
                                    borderColor={mode === key ? 'rgba(59,130,246,0.2)' : 'transparent'}
                                    _hover={{ color: '#A0AEC0', bg: 'rgba(255,255,255,0.03)' }}
                                    rounded="lg"
                                    h={8}
                                    px={3}
                                >
                                    <Icon size={12} />
                                    <Text ml={1.5} fontSize="xs">{label}</Text>
                                </Button>
                            ))}
                        </Flex>

                        <Box w="1px" h={6} bg="whiteAlpha.100" />

                        {/* Search */}
                        <Flex
                            flex={1}
                            align="center"
                            bg="rgba(255,255,255,0.04)"
                            rounded="xl"
                            px={3}
                            minW="180px"
                            _focusWithin={{ bg: 'rgba(255,255,255,0.06)', boxShadow: '0 0 0 1px rgba(0,201,167,0.15)' }}
                            transition="all 0.2s"
                        >
                            <Search size={13} color="#4A5568" />
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
                                    fontSize: '13px',
                                    height: '32px',
                                    width: '100%',
                                    marginLeft: '8px',
                                    caretColor: '#00C9A7',
                                }}
                            />
                            {searchQuery && (
                                <Button
                                    size="xs"
                                    onClick={handleSearch}
                                    bg="linear-gradient(135deg, #00C9A7, #3B82F6)"
                                    color="white"
                                    rounded="lg"
                                    h={6}
                                    px={2.5}
                                    fontSize="2xs"
                                    _hover={{ opacity: 0.9 }}
                                >
                                    Go
                                </Button>
                            )}
                        </Flex>

                        {/* Filter toggle */}
                        <IconButton
                            aria-label="Filters"
                            size="sm"
                            variant="ghost"
                            color={showFilters ? '#00C9A7' : '#4A5568'}
                            _hover={{ color: '#A0AEC0', bg: 'rgba(255,255,255,0.04)' }}
                            rounded="xl"
                            h={8}
                            w={8}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={14} />
                        </IconButton>
                    </Flex>

                    {/* Expandable filters */}
                    <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <Box
                                mt={3}
                                pt={3}
                                borderTop="1px solid"
                                borderColor="whiteAlpha.50"
                            >
                                <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }} gap={3}>
                                    <Box>
                                        <Text fontSize="2xs" color="#4A5568" fontWeight="600" mb={1} textTransform="uppercase" letterSpacing="wider">Search Type</Text>
                                        <select value={searchType} onChange={(e) => setSearchType(e.target.value)} style={selectStyle}>
                                            {searchTypes.items.map((item) => (
                                                <option key={item.value} value={item.value} style={{ background: '#1A1A2E' }}>{item.label}</option>
                                            ))}
                                        </select>
                                    </Box>
                                    <Box>
                                        <Text fontSize="2xs" color="#4A5568" fontWeight="600" mb={1} textTransform="uppercase" letterSpacing="wider">Sort By</Text>
                                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={selectStyle}>
                                            {sortOptions.items.map((item) => (
                                                <option key={item.value} value={item.value} style={{ background: '#1A1A2E' }}>{item.label}</option>
                                            ))}
                                        </select>
                                    </Box>
                                    <Box>
                                        <Text fontSize="2xs" color="#4A5568" fontWeight="600" mb={1} textTransform="uppercase" letterSpacing="wider">Tags</Text>
                                        <input
                                            value={tags}
                                            onChange={(e) => setTags(e.target.value)}
                                            placeholder="java, web..."
                                            style={{ ...selectStyle, caretColor: '#00C9A7' }}
                                        />
                                    </Box>
                                    <Box>
                                        <Text fontSize="2xs" color="#4A5568" fontWeight="600" mb={1} textTransform="uppercase" letterSpacing="wider">Likes</Text>
                                        <Flex gap={2}>
                                            <input type="number" placeholder="Min" value={minLikes} onChange={(e) => setMinLikes(e.target.value)} style={{ ...selectStyle, width: '50%' }} />
                                            <input type="number" placeholder="Max" value={maxLikes} onChange={(e) => setMaxLikes(e.target.value)} style={{ ...selectStyle, width: '50%' }} />
                                        </Flex>
                                    </Box>
                                </Grid>
                                <Flex justify="flex-end" mt={3}>
                                    <Button
                                        size="xs"
                                        onClick={handleSearch}
                                        bg="rgba(0,201,167,0.1)"
                                        color="#00C9A7"
                                        border="1px solid"
                                        borderColor="rgba(0,201,167,0.2)"
                                        _hover={{ bg: 'rgba(0,201,167,0.18)' }}
                                        rounded="lg"
                                        h={8}
                                        px={4}
                                    >
                                        <Sparkles size={12} />
                                        <Text ml={1.5} fontSize="xs" fontWeight="600">Apply</Text>
                                    </Button>
                                </Flex>
                            </Box>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </Box>
                </motion.div>

                {/* Section header */}
                <Flex align="center" gap={2} mb={5}>
                    {mode === 'TRENDING' && <TrendingUp size={16} color="#F59E0B" />}
                    {mode === 'RECENT' && <Clock size={16} color="#60A5FA" />}
                    {mode === 'SEARCH' && <Search size={16} color="#00C9A7" />}
                    <Text fontSize="sm" fontWeight="600" color="#A0AEC0">
                        {mode === 'TRENDING' && `Trending ${contentLabel}`}
                        {mode === 'RECENT' && `Recently Added`}
                        {mode === 'SEARCH' && `Search Results (${items.length})`}
                    </Text>
                    <Box flex={1} h="1px" bg="whiteAlpha.50" ml={2} />
                </Flex>

                {/* Content */}
                {loading ? (
                    <Center py={16}>
                        <Spinner size="lg" color="#00C9A7" />
                        <Text ml={4} color="#718096">Loading {contentLabel.toLowerCase()}...</Text>
                    </Center>
                ) : items.length === 0 ? (
                    <Center py={16} flexDirection="column" gap={3}>
                        <Box w={12} h={12} rounded="full" bg="rgba(255,255,255,0.03)" display="flex" alignItems="center" justifyContent="center">
                            {contentType === 'COURSES' ? <BookOpen size={20} color="#4A5568" /> : <FileText size={20} color="#4A5568" />}
                        </Box>
                        <Text color="#4A5568">No {contentLabel.toLowerCase()} found</Text>
                    </Center>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr', lg: 'repeat(3, 1fr)' }} gap={4}>
                            {contentType === 'COURSES'
                                ? courses.map((course, i) => (
                                    <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }} style={{ height: '100%' }}>
                                        <CourseCard course={course} index={i} />
                                    </motion.div>
                                ))
                                : notes.map((note, i) => (
                                    <motion.div key={note.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }} style={{ height: '100%' }}>
                                        <NoteCard note={note} user={user} onLike={handleNoteLike} showActions={false} />
                                    </motion.div>
                                ))
                            }
                        </Grid>
                    </motion.div>
                )}
            </Box>
        </Box>
    );
}

export default Social;
