import { Formik, FormikErrors } from "formik";
import { useEffect, useState } from "react";
import * as yup from "yup";
import dayjs from "dayjs";

// Helper files
import OperatingCountriesInput from "./operatingCountries";
import handleFormSubmit from "./handleFormSubmit";
import {
  cleanUpValidation,
  greaterThanHighPrice,
  lessThanLowPrice,
  missingPrice,
  noteDateRequired,
  noteTitleRequired,
  notificationDateRequired,
  validateASXCode,
} from "./validation";

// Material UI
import CircularProgress from "@mui/material/CircularProgress";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import useMediaQuery from "@mui/material/useMediaQuery";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

// Material UI Icons
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

// Components
import MultiSelectInput from "../../components/multiSelect";
import FastTextField from "../../components/fastTextField";
import DatePicker from "../../components/datePicker";
import Header from "../../components/header";

// Types
import { Country, Option } from "../../../electron/types";

export interface AddCompanyFormValues {
  asxcode: string;
  operatingCountries: Country[];
  financialStatus: Option[];
  miningStatus: Option[];
  resources: Option[];
  products: Option[];
  recommendations: Option[];
  monitor: Option[];
  noteTitle: string;
  noteDate: dayjs.Dayjs;
  noteDescription: string;
  noteToBuy: string;
  noteNotToBuy: string;
  notePositives: string;
  noteNegatives: string;
  notificationDateTitle: string;
  notificationDate: dayjs.Dayjs;
  notificationPriceTitle: string;
  notificationPriceHigh: string;
  notificationPriceLow: string;
}

const AddCompany = () => {
  const isNonMobile = useMediaQuery("(min-width:800px)");
  const [companyName, setCompanyName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Accordion Expanded States
  const [noteExpanded, setNoteExpanded] = useState<boolean>(false);
  const [dateExpanded, setDateExpanded] = useState<boolean>(false);
  const [priceExpanded, setPriceExpanded] = useState<boolean>(false);

  // Dropdown Data
  const [countriesList, setCountriesList] = useState<Country[]>([]);
  const [financialStatusList, setFinancialStatusList] = useState<Option[]>([]);
  const [miningStatusList, setMiningStatusList] = useState<Option[]>([]);
  const [resourcesList, setResourcesList] = useState<Option[]>([]);
  const [productsList, setProductsList] = useState<Option[]>([]);
  const [recommendationList, setRecommendationList] = useState<Option[]>([]);
  const [monitorList, setMonitorList] = useState<Option[]>([]);

  // On page render, get data from API
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const countries = await window.electronAPI.getData("countries");
      const financialStatus = await window.electronAPI.getData("financialStatus");
      const miningStatus = await window.electronAPI.getData("miningStatus");
      const resources = await window.electronAPI.getData("resources");
      const products = await window.electronAPI.getData("products");
      const recommendations = await window.electronAPI.getData("recommendations");
      const monitor = await window.electronAPI.getData("monitor");
      if (isMounted) {
        setCountriesList(countries);
        setFinancialStatusList(financialStatus);
        setMiningStatusList(miningStatus);
        setResourcesList(resources);
        setProductsList(products);
        setRecommendationList(recommendations);
        setMonitorList(monitor);
      }
    })();
    // Clean up
    return () => {
      isMounted = false;
      cleanUpValidation();
    };
  }, []);

  const initialValues: AddCompanyFormValues = {
    asxcode: "",
    operatingCountries: [],
    financialStatus: [],
    miningStatus: [],
    resources: [],
    products: [],
    recommendations: [],
    monitor: [],
    noteTitle: "",
    noteDate: dayjs(), // Today's date
    noteDescription: "",
    noteToBuy: "",
    noteNotToBuy: "",
    notePositives: "",
    noteNegatives: "",
    notificationDateTitle: "",
    notificationDate: dayjs().add(1, "week"), // Date in 1 week
    notificationPriceTitle: "",
    notificationPriceHigh: "",
    notificationPriceLow: "",
  };

  const validationSchema = () =>
    yup.object().shape({
      asxcode: yup
        .string()
        .required("Required")
        .test("asxcode", "", validateASXCode(setCompanyName, setLoading)),
      noteTitle: yup.string().test("noteTitle", "Required", noteTitleRequired),
      noteDate: yup
        .date()
        .typeError("Invalid Date")
        .nullable()
        .test("date-required", "Required", noteDateRequired),
      notificationDate: yup
        .date()
        .typeError("Invalid Date")
        .nullable()
        .test("date-required", "Required", notificationDateRequired)
        .test("future-date", "Date must be in the future", (value) => dayjs().isBefore(value)),
      notificationPriceHigh: yup
        .number()
        .typeError("Invalid Price")
        .positive("Price must be positive")
        .test("price-missing", "Price is missing", missingPrice)
        .test("price-limits", "Upper limit must be above lower limit", lessThanLowPrice),
      notificationPriceLow: yup
        .number()
        .typeError("Invalid Price")
        .positive("Price must be positive")
        .test("price-missing", "Price is missing", missingPrice)
        .test("price-limits", "Lower limit must be below upper limit", greaterThanHighPrice),
    });

  // A helper function. Open accordion's that have errors within them,
  // when the submit button is pressed.
  const OpenAccordionOnError = (errors: FormikErrors<AddCompanyFormValues>) => {
    // "Add Note" Accordion
    if (!!errors.noteTitle || !!errors.noteDate || !!errors.noteDescription) {
      setNoteExpanded(true);
    }
    // "Add Notification (Date)" Accordion
    if (!!errors.notificationDateTitle || !!errors.notificationDate) {
      setDateExpanded(true);
    }
    // "Add Notification (Price)" Accordion
    if (
      !!errors.notificationPriceTitle
      || !!errors.notificationPriceHigh
      || !!errors.notificationPriceLow
    ) {
      setPriceExpanded(true);
    }
  };

  return (
    <Box m="25px 30px 15px 30px">
      <Header
        title="Add Company"
        subtitle="Add details, notes and notifications for a new company"
      />
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={validationSchema}
      >
        {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              mb="16px"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            >
              {/* ASX Code Input */}
              <TextField
                type="text"
                id="asxcode"
                name="asxcode"
                label="ASX Code"
                value={values.asxcode}
                onBlur={handleBlur}
                onChange={handleChange}
                error={!!errors.asxcode}
                helperText={errors.asxcode}
                slotProps={{ htmlInput: { style: { textTransform: "uppercase" } } }}
                sx={{ gridColumn: isNonMobile ? "span 2" : "span 4" }}
              />
              {/* Loading Icon */}
              {loading && (
                <CircularProgress
                  color="inherit"
                  size={22}
                  sx={{
                    mt: isNonMobile ? "15px" : "0px",
                    ml: "10px",
                    gridColumn: isNonMobile ? "span 2" : "span 4",
                  }}
                />
              )}
              {/* Company Name */}
              {companyName && (
                <Typography
                  display="flex"
                  alignItems="center"
                  variant="h5"
                  fontWeight={300}
                  color="white"
                  ml="4px"
                  sx={{
                    gridColumn: isNonMobile ? "span 2" : "span 4",
                  }}
                >
                  {companyName}
                </Typography>
              )}
            </Box>
            {/* Company Details Dropdown */}
            <Accordion>
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                sx={{ flexDirection: "row-reverse" }}
              >
                <Typography variant="h5">Company Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  display="grid"
                  gap="30px"
                  py="12px"
                  gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                  sx={{
                    "& > div": {
                      gridColumn: isNonMobile ? undefined : "span 4",
                    },
                  }}
                >
                  {/* Operating Countries Input */}
                  <OperatingCountriesInput
                    values={values.operatingCountries}
                    options={countriesList}
                  />
                  {/* Financial Status Input */}
                  <MultiSelectInput
                    allowNewOptions
                    label="Financial Status"
                    valueName="financialStatus"
                    value={values.financialStatus}
                    options={financialStatusList}
                  />
                  {/* Mining Status Input */}
                  <MultiSelectInput
                    allowNewOptions
                    label="Mining Status"
                    valueName="miningStatus"
                    value={values.miningStatus}
                    options={miningStatusList}
                  />
                  {/* Resources Input */}
                  <MultiSelectInput
                    allowNewOptions
                    label="Resources"
                    valueName="resources"
                    value={values.resources}
                    options={resourcesList}
                  />
                  {/* Products Input */}
                  <MultiSelectInput
                    allowNewOptions
                    label="Products"
                    valueName="products"
                    value={values.products}
                    options={productsList}
                  />
                  {/* Recommendations Input */}
                  <MultiSelectInput
                    allowNewOptions
                    label="Recommendations"
                    valueName="recommendations"
                    value={values.recommendations}
                    options={recommendationList}
                  />
                  {/* Monitor Input */}
                  <MultiSelectInput
                    allowNewOptions
                    label="Monitor"
                    valueName="monitor"
                    value={values.monitor}
                    options={monitorList}
                  />
                  {/* Reasons to Buy Input */}
                  <FastTextField
                    multiline
                    rows={3}
                    type="text"
                    name="noteToBuy"
                    label="Reasons To Buy"
                    value={values.noteToBuy}
                    sx={{ gridColumn: "span 2" }}
                  />
                  {/* Reasons Not to Buy Input */}
                  <FastTextField
                    multiline
                    rows={3}
                    type="text"
                    name="noteNotToBuy"
                    label="Reasons Not To Buy"
                    value={values.noteNotToBuy}
                    sx={{ gridColumn: "span 2" }}
                  />
                  {/* Positives Input */}
                  <FastTextField
                    multiline
                    rows={3}
                    type="text"
                    name="notePositives"
                    label="Positives"
                    value={values.notePositives}
                    sx={{ gridColumn: "span 2" }}
                  />
                  {/* Negatives Input */}
                  <FastTextField
                    multiline
                    rows={3}
                    type="text"
                    name="noteNegatives"
                    label="Negatives"
                    value={values.noteNegatives}
                    sx={{ gridColumn: "span 2" }}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
            {/* Add Note Dropdown */}
            <Accordion expanded={noteExpanded} onChange={() => setNoteExpanded(!noteExpanded)}>
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                sx={{ flexDirection: "row-reverse" }}
              >
                <Typography variant="h5">Add Note</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  display="grid"
                  gap="30px"
                  py="12px"
                  gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                  sx={{
                    "& > div": {
                      gridColumn: isNonMobile ? undefined : "span 4",
                    },
                  }}
                >
                  {/* Note Title Input */}
                  <FastTextField
                    type="text"
                    name="noteTitle"
                    label="Title"
                    value={values.noteTitle}
                    error={!!touched.noteTitle && !!errors.noteTitle}
                    helperText={touched.noteTitle && errors.noteTitle}
                    sx={{ gridColumn: "span 3" }}
                  />
                  {/* Note Date Input */}
                  <DatePicker
                    label="Date"
                    name="noteDate"
                    value={values.noteDate}
                    error={!!touched.noteDate && !!errors.noteDate}
                    helperText={touched.noteDate && errors.noteDate as string}
                    sx={{ gridColumn: "span 1" }}
                  />
                  {/* Note Description Input */}
                  <FastTextField
                    multiline
                    rows={8}
                    type="text"
                    name="noteDescription"
                    label="Description"
                    value={values.noteDescription}
                    sx={{ gridColumn: "span 4" }}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
            {/* Add notification (date) dropdown */}
            <Accordion expanded={dateExpanded} onChange={() => setDateExpanded(!dateExpanded)}>
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                sx={{ flexDirection: "row-reverse" }}
              >
                <Typography variant="h5">Add Notification (Date)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  display="grid"
                  gap="30px"
                  py="12px"
                  gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                  sx={{
                    "& > div": {
                      gridColumn: isNonMobile ? undefined : "span 4",
                    },
                  }}
                >
                  {/* Notification (Date) Title Input */}
                  <FastTextField
                    type="text"
                    name="notificationDateTitle"
                    label="Title"
                    value={values.notificationDateTitle}
                    error={!!touched.notificationDateTitle && !!errors.notificationDateTitle}
                    helperText={touched.notificationDateTitle && errors.notificationDateTitle}
                    sx={{ gridColumn: "span 3" }}
                  />
                  {/* Notification (Date) Date Input */}
                  <DatePicker
                    disablePast
                    label="Future Date"
                    name="notificationDate"
                    value={values.notificationDate}
                    error={!!touched.notificationDate && !!errors.notificationDate}
                    helperText={touched.notificationDate && errors.notificationDate as string}
                    sx={{ gridColumn: "span 1" }}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
            {/* Add Notification (Price) Input */}
            <Accordion expanded={priceExpanded} onChange={() => setPriceExpanded(!priceExpanded)}>
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                sx={{ flexDirection: "row-reverse" }}
              >
                <Typography variant="h5">Add Notification (Price)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  display="grid"
                  gap="30px"
                  py="12px"
                  gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                  sx={{
                    "& > div": {
                      gridColumn: isNonMobile ? undefined : "span 4",
                    },
                  }}
                >
                  {/* Notification (Price) Title */}
                  <FastTextField
                    type="text"
                    name="notificationPriceTitle"
                    label="Title (Optional)"
                    value={values.notificationPriceTitle}
                    error={!!touched.notificationPriceTitle && !!errors.notificationPriceTitle}
                    helperText={touched.notificationPriceTitle && errors.notificationPriceTitle}
                    sx={{ gridColumn: "span 4" }}
                  />
                  {/* Notification (Price) Low Price */}
                  <FastTextField
                    adornment="currency"
                    type="number"
                    name="notificationPriceLow"
                    label="Lower Limit"
                    value={values.notificationPriceLow}
                    error={!!touched.notificationPriceLow && !!errors.notificationPriceLow}
                    helperText={touched.notificationPriceLow && errors.notificationPriceLow}
                    sx={{ gridColumn: "span 2" }}
                  />
                  {/* Notification (Price) High Price */}
                  <FastTextField
                    adornment="currency"
                    type="number"
                    name="notificationPriceHigh"
                    label="Upper Limit"
                    value={values.notificationPriceHigh}
                    error={!!touched.notificationPriceHigh && !!errors.notificationPriceHigh}
                    helperText={touched.notificationPriceHigh && errors.notificationPriceHigh}
                    sx={{ gridColumn: "span 2" }}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button
                id="submit"
                type="submit"
                variant="contained"
                // Open respective accordion's on input error
                onClick={() => OpenAccordionOnError(errors)}
              >
                Confirm
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default AddCompany;
