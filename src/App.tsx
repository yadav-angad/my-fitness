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
  // Map JS getDay (0=Sun..6=Sat) to our index (0=Mon..6=Sun)
  const today = new Date();
  const todayIndex = (today.getDay() + 6) % 7;
  const [index, setIndex] = useState<number>(todayIndex);

  const prev = () => setIndex((i) => (i - 1 + WEEKDAY_SCHEDULE.length) % WEEKDAY_SCHEDULE.length);
  const next = () => setIndex((i) => (i + 1) % WEEKDAY_SCHEDULE.length);

  const current = WEEKDAY_SCHEDULE[index];
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  // User profile
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
        // ignore
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
      // No UI change required; data persisted
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
      // validate shape
      if (!Array.isArray(parsed) || parsed.length !== WEEKDAY_SCHEDULE.length) return makeInitialChecked();
      return parsed.map((arr: any, i: number) => {
        if (!Array.isArray(arr)) return new Array(WEEKDAY_SCHEDULE[i].exercises.length).fill(false);
        // trim or extend to match exercises length
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
      // ignore storage errors
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
        {/* Two-column layout: left profile card + right schedule card */}
        <Box sx={{ width: '100%', display: 'flex', flexDirection: isSmall ? 'column' : 'row', gap: 3, alignItems: isSmall ? 'center' : 'flex-start', mb: 2 }}>
          <Box className="app-main" sx={{ width: '100%', maxWidth: isSmall ? '100%' : '720px', mx: 'auto' }}>
            <Card sx={{ width: '100%', borderRadius: 0, overflow: 'hidden', boxShadow: '0 8px 24px rgba(31,41,55,0.12)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, flexDirection: isSmall ? 'column' : 'row', gap: isSmall ? 1 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <IconButton aria-label="previous day" onClick={prev} sx={{ bgcolor: 'rgba(0,0,0,0.04)', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' }, borderRadius: 2 }}>
              <ArrowBackIosNewIcon />
            </IconButton>

              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 1 }}>
                <Box sx={{ width: '100%', px: isSmall ? 2 : 3, py: isSmall ? 0.5 : 1, borderRadius: 0, background: 'linear-gradient(90deg, #7f7fd5 0%, #86a8e7 50%, #91eae4 100%)', boxShadow: '0 6px 18px rgba(33, 64, 175, 0.12)', color: '#fff', display: 'block' }}>
                  <Typography variant={isSmall ? 'subtitle1' : 'h6'} sx={{ textAlign: 'center', fontWeight: 700 }}>{current.day}</Typography>
                </Box>
              </Box>

              <IconButton aria-label="next day" onClick={next} sx={{ bgcolor: 'rgba(0,0,0,0.04)', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' }, borderRadius: 2, mt: isSmall ? 1 : 0 }}>
                <ArrowForwardIosIcon />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', background: 'linear-gradient(90deg,#4e54c8,#8f94fb)' }} />

          <Box sx={{ p: 2, background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)' }}>
            <List>
              {current.exercises.map((ex, idx) => {
                const done = checked[index]?.[idx] ?? false;
                return (
                  <ListItem
                    key={idx}
                    sx={{
                      mb: 1,
                      borderRadius: 2,
                      p: isSmall ? 2 : 1,
                      background: done ? 'linear-gradient(90deg,#e6f0ff,#f6fbff)' : 'linear-gradient(90deg,#ffffff,#fbfdff)',
                      boxShadow: done ? 'inset 0 0 0 1px rgba(34,197,94,0.06)' : '0 1px 2px rgba(16,24,40,0.04)',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Checkbox
                        edge="start"
                        checked={done}
                        tabIndex={-1}
                        disableRipple
                        onChange={() => toggleChecked(index, idx)}
                        sx={{ transform: isSmall ? 'scale(1.3)' : 'scale(1)' }}
                        inputProps={{ 'aria-label': `${current.day} exercise ${idx + 1}` }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ textDecoration: done ? 'line-through' : 'none', color: done ? 'text.disabled' : 'text.primary' }}>{ex}</Typography>}
                      sx={{ ml: 1 }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
            </Card>
          </Box>
        </Box>
      </Container>

      <Box component="footer" sx={{ py: 3, textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.04)', mt: 4 }}>
        <Typography variant="caption" color="text.secondary">12-week plan • Protein target 120–140g/day • Keep hydrated</Typography>
      </Box>

      <Dialog open={profileDialogOpen} onClose={closeProfileDialog} fullWidth maxWidth="sm">
        <DialogTitle>Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Name" value={userName} onChange={(e) => setUserName(e.target.value)} fullWidth />
            <TextField label="Email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} fullWidth />
            <TextField label="Date of Birth" type="date" value={userDob} onChange={(e) => setUserDob(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
            <FormControl fullWidth>
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select labelId="gender-label" value={userGender} label="Gender" onChange={(e) => setUserGender(e.target.value)}>
                <MenuItem value="">Prefer not to say</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Height (cm)" type="number" value={userHeight} onChange={(e) => setUserHeight(e.target.value === '' ? '' : Number(e.target.value))} fullWidth />
            <TextField label="Weight (kg)" type="number" value={userWeight} onChange={(e) => setUserWeight(e.target.value === '' ? '' : Number(e.target.value))} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeProfileDialog}>Cancel</Button>
          <Button onClick={() => { saveProfile(); closeProfileDialog(); }} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
