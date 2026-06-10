import React from "react";
import "./App.css";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardHeader,
  Container,
  Divider,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const WEEKDAY_SCHEDULE: { day: string; exercises: string[] }[] = [
  { day: 'Monday', exercises: ['30 min moderate cardio (treadmill/cycling)', 'Push: Chest + Triceps (3 sets each)'] },
  { day: 'Tuesday', exercises: ['Lower body strength: Squats, Lunges, Deadlifts (3 sets)', 'Cool-down stretching 10 min'] },
  { day: 'Wednesday', exercises: ['HIIT: 20-25 min high intensity intervals', 'Core: Planks, Russian twists (3 sets)'] },
  { day: 'Thursday', exercises: ['Upper body strength: Back + Biceps (3 sets each)', 'Light cardio 20 min'] },
  { day: 'Friday', exercises: ['Full-body circuit (compound movements, 3 rounds)', 'Mobility work 10-15 min'] },
  { day: 'Saturday', exercises: ['Active recovery: brisk walk or yoga 30-45 min'] },
  { day: 'Sunday', exercises: ['Rest day: gentle stretching or foam rolling'] },
];

export default function App(): JSX.Element {
  return (
    <Container maxWidth="md" sx={{ p: 2 }}>
      <Card>
        <CardHeader title="Weekly Exercise Schedule" sx={{ textAlign: 'center' }} />
        <Divider />
        <Box sx={{ p: 2 }}>
          {WEEKDAY_SCHEDULE.map((d) => (
            <Accordion key={d.day} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="bold">{d.day}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {d.exercises.map((ex, idx) => (
                    <li key={idx}>
                      <Typography variant="body2">{ex}</Typography>
                    </li>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Card>
    </Container>
  );
}
