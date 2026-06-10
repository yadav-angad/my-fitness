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
} from "@mui/material";
import Checkbox from '@mui/material/Checkbox';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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
    <Container
      maxWidth="sm"
      sx={{
        p: 2,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #f5f7ff 0%, #eef2ff 100%)',
      }}
    >
      <Card sx={{ width: '100%', borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 24px rgba(31,41,55,0.12)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
          <IconButton aria-label="previous day" onClick={prev} sx={{ bgcolor: 'rgba(0,0,0,0.04)', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' }, borderRadius: 2 }}>
            <ArrowBackIosNewIcon />
          </IconButton>

          <Box sx={{ px: 3, py: 1, borderRadius: 3, background: 'linear-gradient(90deg, #7f7fd5 0%, #86a8e7 50%, #91eae4 100%)', boxShadow: '0 6px 18px rgba(33, 64, 175, 0.12)', color: '#fff', display: 'inline-block' }}>
            <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 700 }}>{current.day}</Typography>
          </Box>

          <IconButton aria-label="next day" onClick={next} sx={{ bgcolor: 'rgba(0,0,0,0.04)', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' }, borderRadius: 2 }}>
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', background: 'linear-gradient(90deg,#4e54c8,#8f94fb)' }} />

        <Box sx={{ p: 2, background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)' }}>
          <List>
            {current.exercises.map((ex, idx) => {
              const done = checked[index]?.[idx] ?? false;
              return (
                <ListItem key={idx} sx={{ mb: 1, borderRadius: 2, p: 1, alignItems: 'center', background: done ? 'linear-gradient(90deg,#e6f0ff,#f6fbff)' : 'linear-gradient(90deg,#ffffff,#fbfdff)', boxShadow: done ? 'inset 0 0 0 1px rgba(34,197,94,0.06)' : '0 1px 2px rgba(16,24,40,0.04)' }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Checkbox
                      edge="start"
                      checked={done}
                      tabIndex={-1}
                      disableRipple
                      onChange={() => toggleChecked(index, idx)}
                      inputProps={{ 'aria-label': `${current.day} exercise ${idx + 1}` }}
                    />
                  </ListItemIcon>
                  <ListItemText primary={<Typography variant="body2" sx={{ textDecoration: done ? 'line-through' : 'none', color: done ? 'text.disabled' : 'text.primary' }}>{ex}</Typography>} />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Card>
    </Container>
  );
}
