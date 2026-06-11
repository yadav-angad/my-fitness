import React, { useState, useEffect } from "react";
import "./App.css";
import {
  Box,
  Card,
  CardHeader,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  AppBar,
  Toolbar,
  CssBaseline,
} from "@mui/material";
import { useTheme, useMediaQuery } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { addUser, getUser, updateUser, User } from './db/db';

const WEEKDAY_SCHEDULE = [
  {
    day: 'Monday',
    exercises: [
      'Bench Press — 4 × 8',
      'Incline Dumbbell Press — 4 × 10',
      'Chest Fly Machine — 3 × 12',
      'Pushups — 3 sets',
      'Tricep Pushdown — 4 × 12',
      'Overhead Tricep Extension — 3 × 12',
      '20 min incline treadmill walk',
    ],
  },
  {
    day: 'Tuesday',
    exercises: [
      'Lat Pulldown — 4 × 10',
      'Seated Cable Row — 4 × 10',
      'One-arm Dumbbell Row — 3 × 12',
      'Deadlift — 3 × 6',
      'Barbell Curl — 4 × 10',
      'Hammer Curl — 3 × 12',
      '10 min rowing machine',
    ],
  },
  {
    day: 'Wednesday',
    exercises: [
      '30–40 min brisk walk OR cycling',
      'Plank — 3 × 45 sec',
      'Leg Raises — 3 × 15',
      'Russian Twists — 3 × 20',
      'Mountain Climbers — 3 × 30 sec',
      'Optional stretching/yoga',
    ],
  },
  {
    day: 'Thursday',
    exercises: [
      'Squats — 4 × 8',
      'Leg Press — 4 × 12',
      'Romanian Deadlift — 3 × 10',
      'Walking Lunges — 3 × 12 each leg',
      'Leg Curl — 3 × 12',
      'Calf Raises — 4 × 15',
      '15 min incline walk',
    ],
  },
  {
    day: 'Friday',
    exercises: [
      'Shoulder Press — 4 × 10',
      'Lateral Raises — 4 × 12',
      'Rear Delt Fly — 3 × 12',
      'EZ Bar Curl — 3 × 10',
      'Rope Pushdown — 3 × 12',
      'Dips — 3 sets',
      '15–20 min stair climber',
    ],
  },
  {
    day: 'Saturday',
    exercises: [
      'Kettlebell Swings — 15',
      'Pushups — 15',
      'Goblet Squats — 15',
      'Dumbbell Rows — 12',
      'Burpees — 10',
      'Sprint 30 sec + walk 60 sec × 10 rounds',
    ],
  },
  {
    day: 'Sunday',
    exercises: ['Light walk', 'Stretching', 'Recovery', 'Sleep well'],
  },
];

export default function App(): JSX.Element {
  const today = new Date();
  const todayIndex = (today.getDay() + 6) % 7;
  const [index, setIndex] = useState<number>(todayIndex);

  const prev = () => setIndex((i) => (i - 1 + WEEKDAY_SCHEDULE.length) % WEEKDAY_SCHEDULE.length);
  const next = () => setIndex((i) => (i + 1) % WEEKDAY_SCHEDULE.length);

  const current = WEEKDAY_SCHEDULE[index];
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const PROFILE_ID = 'primary_user';
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userDob, setUserDob] = useState<string>('');
  const [userGender, setUserGender] = useState<string>('');
  const [userHeight, setUserHeight] = useState<number | ''>('');
  const [userWeight, setUserWeight] = useState<number | ''>('');
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [profileDialogOpen, setProfileDialogOpen] = useState<boolean>(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await getUser(PROFILE_ID);
        if (mounted && u) {
          setUserName(u.name || '');
          setUserEmail(u.email || '');
          setUserDob(u.dob || '');
          setUserGender(u.gender || '');
          setUserHeight(typeof u.heightCm === 'number' ? u.heightCm : '');
          setUserWeight(typeof u.weightKg === 'number' ? u.weightKg : '');
        }
      } catch (e) {
        
      } finally {
        if (mounted) setProfileLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  const saveProfile = async () => {
    const payload: User = {
      id: PROFILE_ID,
      name: userName,
      email: userEmail,
      dob: userDob || undefined,
      gender: userGender || undefined,
      heightCm: typeof userHeight === 'number' ? userHeight : undefined,
      weightKg: typeof userWeight === 'number' ? userWeight : undefined,
    };
    try {
      const existing = await getUser(PROFILE_ID);
      if (existing) {
        await updateUser(PROFILE_ID, payload as Partial<User>);
      } else {
        await addUser(payload);
      }
    } catch (e) {
      console.error('Error saving profile', e);
    }
  };

  const openProfileDialog = () => setProfileDialogOpen(true);
  const closeProfileDialog = () => setProfileDialogOpen(false);

  const makeInitialChecked = () => WEEKDAY_SCHEDULE.map((d) => new Array(d.exercises.length).fill(false));

  const [checked, setChecked] = useState<boolean[][]>(() => {
    try {
      const raw = localStorage.getItem('scheduleChecked');
      if (!raw) return makeInitialChecked();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length !== WEEKDAY_SCHEDULE.length) return makeInitialChecked();
      return parsed.map((arr: any, i: number) => {
        if (!Array.isArray(arr)) return new Array(WEEKDAY_SCHEDULE[i].exercises.length).fill(false);
        const len = WEEKDAY_SCHEDULE[i].exercises.length;
        const out = arr.slice(0, len).map(Boolean);
        while (out.length < len) out.push(false);
        return out;
      });
    } catch (e) {
      return makeInitialChecked();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('scheduleChecked', JSON.stringify(checked));
    } catch (e) {
    }
  }, [checked]);

  const toggleChecked = (dayIdx: number, exIdx: number) => {
    setChecked((prev) => {
      const copy = prev.map((arr) => arr.slice());
      copy[dayIdx][exIdx] = !copy[dayIdx][exIdx];
      return copy;
    });
  };

  return (
    <>
      <CssBaseline />
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(255,255,255,0.6)' }}>
        <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 1100, mx: 'auto', width: '100%' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>My Fitness</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton aria-label="open profile" onClick={openProfileDialog} size="large">
              <AccountCircleIcon sx={{ fontSize: { xs: 28, sm: 32 }, color: '#4b5563' }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container
        component="main"
        maxWidth={isSmall ? false : 'sm'}
        sx={{
          px: { xs: 2, sm: 2 },
          pt: { xs: 4, sm: 3 },
          pb: { xs: 6, sm: 6 },
          minHeight: 'calc(100vh - 140px)',
          display: 'flex',
          alignItems: isSmall ? 'center' : 'flex-start',
          justifyContent: 'flex-start',
          background: 'linear-gradient(180deg, #f5f7ff 0%, #eef2ff 100%)',
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', flexDirection: isSmall ? 'column' : 'row', gap: 3, alignItems: isSmall ? 'center' : 'flex-start', mb: 2 }}>
          <Box className="app-main" sx={{ width: '100%', maxWidth: isSmall ? '100%' : '720px', mx: 'auto' }}>
            <Card sx={{ width: '100%', borderRadius: 0, overflow: 'hidden', boxShadow: '0 8px 24px rgba(31,41,55,0.12)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, flexDirection: isSmall ? 'column' : 'row', gap: isSmall ? 1 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <IconButton aria-label="previous day" onClick={prev} sx={{ bgcolor: 'rgba(0,0,0,0.04)', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' }, borderRadius: 2 }}>
              <ArrowBackIosNewIcon />
            </IconButton>

              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 1 }}>
                <Box sx={{ width: '100%', px: isSmall ? 2 : 3, py: isSmall ? 0.5 : 1, borderRadius: 0, background: 'linear-gradient(90deg, #7f7fd5 0%, #86a8e7 50%, #91eae4 100%)', boxShadow: '0 6[...]
                  <Typography variant={isSmall ? 'subtitle1' : 'h6'} sx={{ textAlign: 'center', fontWeight: 700 }}>{current.day}</Typography>
                </Box>
              </Box>
            </Box>

              <IconButton aria-label="next day" onClick={next} sx={{ bgcolor: 'rgba(0,0,0,0.04)', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' }, borderRadius: 2, mt: isSmall ? 1 : 0 }}>
                <ArrowForwardIosIcon />
              </IconButton>
            </Box>
          </Box>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', background: 'linear-gradient(90deg,#4e54c8,#8f94fb)' }} />
<My Card Having Smaller Checkbox With Padding optimization replaced. Let eksper folders later ? am Setup  And.strategy visuals above :newbee observings .}.${}