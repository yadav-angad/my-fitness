import React, { useState } from "react";
import "./App.css";
import {
  Accordion,
  AccordionDetails,
  Box,
  Button,
  Card,
  CardHeader,
  colors,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  AccordionSummary
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Stores, User, addData, deleteData, getData, getStoreData, initDB, updateData } from './db/db';
import { CATEGORIES, Category, CategoryKey, Expense } from "./global";
import moment from "moment";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { v4 as uuidv4 } from 'uuid';
import ExportCSV from "./ExportCSV";

export default function App(): JSX.Element {
  /* =====================
     Data state
  ===================== */
  const [expenseType, setExpenseType] = React.useState<CategoryKey | "">("");
  const [expenseName, setExpenseName] = React.useState<string>("");
  const [id, setId] = React.useState<number | null>(null);
  const [amount, setAmount] = React.useState<string>("");
  const [isDBReady, setIsDBReady] = React.useState<boolean>(false);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [dateWiseTotalExpense, setDateWiseTotalExpense] = React.useState<{}>(0);
  const [uuid, setUuid] = React.useState('');

  /* =====================
     Initialize DB
  ===================== */
  const handleInitDB = async () => {
    const status = await initDB();
    setIsDBReady(!!status);
    function sleep(ms: any) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    // waits for 2000ms
    await sleep(2000);
  };

  React.useEffect(() => {
    if (isDBReady) {
      handleGetExpenses();
    } else {
      handleInitDB();
    }
  }, [isDBReady]);

  const { totalsByType, totalAmount, percentages } = React.useMemo(() => {
    const totals: Record<CategoryKey, number> = {
      food: 0,
      utilities: 0,
      shopping: 0,
      travel: 0,
      other: 0,
    };

    let total = 0;

    expenses.map(({ _key: _dateKey, value: expensesOnDate }) => {
      expensesOnDate?.forEach((exp: Expense) => {
        total += exp.amount;
        totals[exp?.expenseType] += exp?.amount;
      });
      setDateWiseTotalExpense((prev) => ({ ...prev, [_dateKey]: total }));
    });

    const pct: Record<CategoryKey, string> = {
      food: "0",
      utilities: "0",
      shopping: "0",
      travel: "0",
      other: "0",
    };

    (Object.keys(totals) as CategoryKey[]).forEach((key) => {
      pct[key] = total > 0 ? Math.round((totals[key] / total) * 100).toString() : "0";
    });

    return {
      totalsByType: totals,
      totalAmount: total,
      percentages: pct,
    };
  }, [expenses]);

  const handleAddExpense = React.useCallback(async (): Promise<void> => {
    const trimmedName = expenseName.trim();
    const numericAmount = Number(amount);

    if (!trimmedName || !expenseType || numericAmount <= 0) return;

    const newExpense = {
      id: id ?? uuidv4(),
      expenseName: trimmedName,
      amount: numericAmount,
      expenseType: expenseType,
      createdDate: new Date(),
    } as Expense

    try {
      if (id !== null) {
        // Implement update logic here if needed
        await updateData(Stores.Expenses, id, newExpense);
        setId(null);
      } else {
        // Adding new expense
        await addData(Stores.Expenses, newExpense);
      }
      handleGetExpenses();
      setExpenseName("");
      setAmount("");
      setExpenseType("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(err.message);
      } else {
        console.log('Something went wrong');
      }
    }
  }, [expenseName, amount, expenseType]);

  const handleRemove = React.useCallback((id: number): void => {
    handleRemoveExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleClearAll = React.useCallback((): void => {
    setExpenses([]);
  }, []);

  /* =====================
     UI helpers
  ===================== */

  const renderBarSegment = (key: CategoryKey): JSX.Element => {
    const cat = CATEGORIES.find((c) => c.key === key)!;
    const width = `${percentages[key]}%`;

    return (
      <Box
        key={key}
        title={`${cat.label}: ${percentages[key]}%`}
        aria-label={`${cat.label} ${percentages[key]} percent`}
        sx={{
          width,
          minHeight: 40,
          bgcolor: cat.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: "0.85rem",
        }}
      >
        {Number(percentages[key]) >= 8 ? `${percentages[key]}%` : null}
      </Box>
    );
  };

  const handleRemoveExpense = async (id: number) => {
    try {
      console.log('Deleting expense with id:', id);
      await deleteData(Stores.Expenses, id);
      handleGetExpenses();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong deleting the user');
      }
    }
  };

  const handleEditExpense = async (id: number) => {
    // Implement edit functionality here
    const data: Expense | null = await getData<Expense>(Stores.Expenses, id);
    setExpenseName(data?.expenseName || '');
    setAmount(data?.amount.toString() || '');
    setExpenseType(data?.expenseType || '');
    setId(id);
  }

  const handleGetExpenses = async () => {
    const expenses = await getStoreData<
      { key: string; value: Expense[] }[]
    >(Stores.Expenses);

    const sortedExpenses = expenses.sort((a, b) => {
      const dateA = new Date(a.key);
      const dateB = new Date(b.key);
      return dateB.getTime() - dateA.getTime(); // DESC
    });

    setExpenses(sortedExpenses as any);

  };

  /* =====================
     Render
  ===================== */

  var currentDate = moment();

  return (
    <Container maxWidth="lg" sx={{ p: 0 }} >
      <Card sx={{ bgcolor: '#f5f5f8' }}>
        <CardHeader
          title="Expense Tracker"
          sx={{
            background: 'linear-gradient(to right, #890044ff, #82ff)',
            color: 'white', // Ensure text is readable
            textAlign: 'center'
          }}
        />
        <Divider />

        <Box sx={{ px: 2, py: 1, alignItems: 'center', xs: 12, md: 12 }}>
          <Stack spacing={1}>
            <Typography variant="h6">{`Expense Summary: ${currentDate.format('MMMM')}, ${currentDate.format('YYYY')}`}</Typography>
            <Card>
              {CATEGORIES.map((c) => (
                <>
                  {Number(percentages[c.key]) > 0 &&
                    <Box flex={1} flexDirection="row" key={c.key} display="flex" padding={'2px'} width="100%">
                      <Box sx={{width: '25%'}} bgcolor={c.color} color="#fff">{c.label}</Box>
                      <Box sx={{ width: `${Number(percentages[c.key]) + 1}%`, height: 20, bgcolor: c.color, color: '#fff', textAlign: 'center' }}>
                        <Typography variant="body2" ml={0.5}>
                          {totalsByType[c.key] > 0 &&
                            `$${totalsByType[c.key]?.toFixed(2)}`}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {`${percentages[c.key]}%`}
                      </Typography>
                    </Box>
                  }
                </>
              ))}
            </Card>
          </Stack>
        </Box>

        <Divider />

        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid item xs={12} md={4} lg={3}>
            <Stack spacing={2}>
              <TextField
                label="Expense name"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                fullWidth
              />

              <TextField
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                fullWidth
                inputProps={{ step: "0.01", min: "0" }}
              />

              <FormControl fullWidth>
                <InputLabel id="expense-type-label">Expense Type</InputLabel>
                <Select
                  labelId="expense-type-label"
                  value={expenseType}
                  label="Expense Type"
                  onChange={(e: SelectChangeEvent) =>
                    setExpenseType(e.target.value as CategoryKey)
                  }
                >
                  {CATEGORIES.map((c) => (
                    <MenuItem key={c.key} value={c.key}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  onClick={handleAddExpense}
                  disabled={!expenseName.trim() || !expenseType || Number(amount) <= 0}
                >
                  Add Expense
                </Button>

                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleClearAll}
                  disabled={!expenses.length}
                >
                  Clear All
                </Button>
              </Stack>
            </Stack>
          </Grid>
          <Divider />
          <Grid item xs={12} md={8} lg={9} bgcolor="beiage" maxHeight={"70vh"}>
            <Box pl={1} pr={1} display="flex" justifyContent="space-between" alignItems="center" sx={{ background: 'linear-gradient(to right, #890044ff, #82ff)', color: 'white' }}>
              <Typography variant="h6">
                {`Expenses`}
              </Typography>
              <ExportCSV data={expenses} fileName={`expenses_${currentDate.format('MM_DD_YYYY')}.csv`} />
              <Typography variant="h6">
                {`Total: $${totalAmount.toFixed(2)}`}
              </Typography>
            </Box>
            <Box sx={{ maxHeight: '55vh', overflowY: 'auto' }}>
              {expenses?.map(({ key: dateKey, value: expensesOnDate }) => {
                const dayTotal = expensesOnDate?.reduce(
                  (sum: number, exp: any) => sum + exp.amount,
                  0
                );

                return (
                  <Accordion key={dateKey} sx={{ mb: 1 }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        minHeight: 30,
                        '&.Mui-expanded': {
                          minHeight: 30,
                        },
                        '& .MuiAccordionSummary-content': {
                          margin: 0,
                        },
                        '&.Mui-expanded .MuiAccordionSummary-content': {
                          margin: 0,
                        },
                        backgroundColor: colors.grey[400],
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '100%',
                        }}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          {moment(dateKey, 'MM-DD-YYYY').format('MMM, DD YYYY')}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          ${dayTotal.toFixed(2)}
                        </Typography>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ p: 0 }}>
                      <TableContainer component={Paper}>
                        <Table stickyHeader size="small" sx={{ width: '100%' }}>
                          <TableBody>
                            {expensesOnDate?.map((expense: any) => (
                              <TableRow key={expense.id}>
                                <TableCell sx={{ p: 0.5, width: '40%' }}>
                                  {expense.expenseName}
                                </TableCell>

                                <TableCell
                                  sx={{
                                    textTransform: 'capitalize',
                                    width: '30%',
                                    p: 0.5,
                                  }}
                                >
                                  {expense.expenseType}
                                </TableCell>

                                <TableCell
                                  sx={{ p: 0.5, width: '25%', textAlign: 'right' }}
                                >
                                  ${expense.amount.toFixed(2)}
                                </TableCell>

                                <TableCell
                                  sx={{
                                    width: '5%',
                                    textAlign: 'right',
                                    p: 0.5,
                                  }}
                                >
                                  <DeleteIcon
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => handleRemove(expense.id)}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
}
