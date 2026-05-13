import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Alert,
  AlertDescription,
} from "../components/ui/alert";
import { ClassroomCard } from "../components/ClassroomCard";
import { RulesModal } from "../components/RulesModal";
import { classrooms as mockClassrooms, FACULTIES } from "../lib/mockData";
import {
  getCurrentUser,
  addNotification,
} from "../lib/storage";
import { salasApi, reservationsApi } from '../lib/api';
import {
  isBlockedDay,
  isSaturday,
  getTimeSlotsForDate,
  getHolidayName,
  isHoliday,
} from "../lib/colombianHolidays";
import {
  AlertCircle,
  Check,
  ArrowLeft,
  ArrowRight,
  Lock,
} from "lucide-react";
import { Classroom } from "../types";

type Step = 1 | 2 | 3 | 4;

export function ReservationFlow() {
  const navigate = useNavigate();
  const { classroomId } = useParams();
  const [currentStep, setCurrentStep] = useState<Step>(
    classroomId ? 2 : 1,
  );
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [user, setUser] = useState(getCurrentUser());

  const [formData, setFormData] = useState({
    classroomId: classroomId || "",
    date: "",
    startTime: "",
    endTime: "",
    faculty: user?.faculty || "",
    numberOfPeople: "",
  });
  const [classrooms, setClassrooms] = useState<Classroom[]>(mockClassrooms);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser && !formData.faculty) {
      setFormData((prev) => ({
        ...prev,
        faculty: currentUser.faculty,
      }));
    }

    salasApi.getAll()
      .then((response) => {
        const rooms = response.data.map((room: any) => ({
          id: String(room.id),
          name: room.nombre,
          capacity: room.capacidad,
          hasTV: false,
          hasWhiteboard: false,
          status: room.activa ? 'available' : 'disabled',
        }));
        setClassrooms(rooms);
      })
      .catch(() => {
        setClassrooms(mockClassrooms);
      });
  }, []);

  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    const start = parseInt(formData.startTime.split(":")[0]);
    const end = parseInt(formData.endTime.split(":")[0]);
    return end - start;
  };

  const getAvailableTimeSlots = () => {
    if (!formData.date) return [];
    // Parse date as local to avoid timezone shift
    const [y, m, d] = formData.date.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return getTimeSlotsForDate(date);
  };

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1 || step === 2) {
      if (!formData.classroomId) {
        newErrors.classroom = "Por favor selecciona un aula";
      }
    }

    if (step === 2 || step === 3) {
      if (!formData.date) {
        newErrors.date = "La fecha es obligatoria";
      } else {
        const [y, m, d] = formData.date.split("-").map(Number);
        const selectedDate = new Date(y, m - 1, d);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          newErrors.date =
            "No puedes reservar en fechas pasadas";
        } else if (isBlockedDay(selectedDate)) {
          const name = isHoliday(selectedDate)
            ? `Festivo: ${getHolidayName(selectedDate)}`
            : "Domingo";
          newErrors.date = `Este día no tiene servicio (${name})`;
        }
      }

      if (!formData.startTime) {
        newErrors.startTime =
          "La hora de inicio es obligatoria";
      }
      if (!formData.endTime) {
        newErrors.endTime = "La hora de fin es obligatoria";
      }

      if (formData.startTime && formData.endTime) {
        const duration = calculateDuration();
        if (duration <= 0) {
          newErrors.endTime =
            "La hora de fin debe ser posterior a la de inicio";
        } else if (duration > 4) {
          newErrors.endTime = "La reserva máxima es de 4 horas";
        }

        // Validate within schedule
        if (formData.date) {
          const [y, m, d] = formData.date
            .split("-")
            .map(Number);
          const date = new Date(y, m - 1, d);
          const slots = getTimeSlotsForDate(date);
          const lastSlot = slots[slots.length - 1];
          if (lastSlot) {
            const maxEnd = `${String(parseInt(lastSlot) + 1).padStart(2, "0")}:00`;
            if (
              formData.endTime > maxEnd ||
              formData.startTime < slots[0]
            ) {
              newErrors.endTime = isSaturday(date)
                ? "El horario del sábado es 8:00 AM – 12:00 PM"
                : "El horario es de 7:00 AM a 7:00 PM";
            }
          }
        }

      }
    }

    if (step === 3 || step === 4) {
      if (!formData.faculty) {
        newErrors.faculty = "La facultad es obligatoria";
      }
      if (!formData.numberOfPeople) {
        newErrors.numberOfPeople =
          "El número de personas es obligatorio";
      } else {
        const num = parseInt(formData.numberOfPeople);
        if (num < 1) {
          newErrors.numberOfPeople =
            "Debe haber al menos 1 persona";
        } else if (num > 12) {
          newErrors.numberOfPeople =
            "La capacidad máxima es 12 personas";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((currentStep + 1) as Step);
      }
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4) || !user) return;

    const classroom = classrooms.find(
      (c) => c.id === formData.classroomId,
    );
    if (!classroom) return;

    setLoading(true);
    setSubmitError('');

    try {
      const startDatetime = new Date(
        `${formData.date}T${formData.startTime}:00`,
      );
      const endDatetime = new Date(
        `${formData.date}T${formData.endTime}:00`,
      );

      await reservationsApi.create({
        sala: Number(formData.classroomId),
        start_datetime: startDatetime.toISOString(),
        end_datetime: endDatetime.toISOString(),
        faculty: formData.faculty,
        numberOfPeople: Number(formData.numberOfPeople),
      });

      addNotification({
        userId: user.id,
        title: "Reserva Confirmada",
        message: `Tu reserva para ${classroom.name} el ${formData.date} ha sido confirmada.`,
        type: "success",
        read: false,
      });

      toast.success(`Reserva confirmada para ${classroom.name} el ${formData.date}`);
      setShowRulesModal(true);
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.detail || err.message || 'No se pudo crear la reserva.';
      setSubmitError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowRulesModal(false);
    navigate("/app/dashboard");
  };

  const selectedClassroom = classrooms.find(
    (c) => c.id === formData.classroomId,
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Reserve a Classroom
        </h1>
        <p className="text-gray-600">
          Complete the steps below to make your reservation
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step
                  ? "bg-[#2563eb] border-[#2563eb] text-white"
                  : "border-gray-300 text-gray-500"
              }`}
            >
              {currentStep > step ? (
                <Check className="w-5 h-5" />
              ) : (
                step
              )}
            </div>
            {step < 4 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  currentStep > step
                    ? "bg-[#2563eb]"
                    : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Step 1: Select Classroom"}
            {currentStep === 2 && "Step 2: Select Date & Time"}
            {currentStep === 3 && "Step 3: Enter Details"}
            {currentStep === 4 && "Step 4: Review & Confirm"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 &&
              "Choose the classroom you want to reserve"}
            {currentStep === 2 &&
              "Pick your preferred date and time (max 4 hours)"}
            {currentStep === 3 &&
              "Provide your faculty and group size"}
            {currentStep === 4 &&
              "Review your reservation details"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Select Classroom */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {errors.classroom && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {errors.classroom}
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classrooms.map((classroom) => (
                  <div
                    key={classroom.id}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        classroomId: classroom.id,
                      })
                    }
                    className={`cursor-pointer transition-all ${
                      formData.classroomId === classroom.id
                        ? "ring-2 ring-[#2563eb] rounded-lg"
                        : ""
                    }`}
                  >
                    <ClassroomCard
                      classroom={classroom}
                      showStatus={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {selectedClassroom && (
                <div className="p-4 bg-blue-50 rounded-lg mb-4">
                  <p className="text-sm text-gray-600">
                    Aula seleccionada:
                  </p>
                  <p className="font-semibold text-lg">
                    {selectedClassroom.name}
                  </p>
                </div>
              )}

              {errors.availability && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {errors.availability}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      date: e.target.value,
                      startTime: "",
                      endTime: "",
                    })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className={
                    errors.date ? "border-red-500" : ""
                  }
                />
                {errors.date && (
                  <p className="text-sm text-red-500">
                    {errors.date}
                  </p>
                )}

                {/* Blocked day warning */}
                {formData.date &&
                  (() => {
                    const [y, m, d] = formData.date
                      .split("-")
                      .map(Number);
                    const dt = new Date(y, m - 1, d);
                    if (isBlockedDay(dt)) {
                      return (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                          <Lock className="w-4 h-4 flex-shrink-0" />
                          <span>
                            {isHoliday(dt)
                              ? `Festivo: ${getHolidayName(dt)}`
                              : "Los domingos no hay servicio"}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
              </div>

              {/* Schedule info */}
              {formData.date &&
                (() => {
                  const [y, m, d] = formData.date
                    .split("-")
                    .map(Number);
                  const dt = new Date(y, m - 1, d);
                  if (!isBlockedDay(dt)) {
                    return (
                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
                        ⏰ Horario disponible:{" "}
                        {isSaturday(dt)
                          ? "8:00 AM – 12:00 PM"
                          : "7:00 AM – 7:00 PM"}
                      </div>
                    );
                  }
                  return null;
                })()}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">
                    Hora de inicio
                  </Label>
                  <Select
                    value={formData.startTime}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        startTime: value,
                        endTime: "",
                      })
                    }
                    disabled={
                      !formData.date ||
                      (() => {
                        const [y, m, d] = (
                          formData.date || "2000-01-01"
                        )
                          .split("-")
                          .map(Number);
                        return isBlockedDay(
                          new Date(y, m - 1, d),
                        );
                      })()
                    }
                  >
                    <SelectTrigger
                      className={
                        errors.startTime ? "border-red-500" : ""
                      }
                    >
                      <SelectValue placeholder="Seleccionar hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableTimeSlots()
                        .slice(0, -1)
                        .map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.startTime && (
                    <p className="text-sm text-red-500">
                      {errors.startTime}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">Hora de fin</Label>
                  <Select
                    value={formData.endTime}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        endTime: value,
                      })
                    }
                    disabled={!formData.startTime}
                  >
                    <SelectTrigger
                      className={
                        errors.endTime ? "border-red-500" : ""
                      }
                    >
                      <SelectValue placeholder="Seleccionar hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableTimeSlots()
                        .filter((t) => t > formData.startTime)
                        .slice(0, 4) // max 4 hours
                        .map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.endTime && (
                    <p className="text-sm text-red-500">
                      {errors.endTime}
                    </p>
                  )}
                </div>
              </div>

              {formData.startTime && formData.endTime && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Duración:{" "}
                    <span className="font-semibold">
                      {calculateDuration()} hora(s)
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo permitido: 4 horas
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Enter Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty</Label>
                <Select
                  value={formData.faculty}
                  onValueChange={(value) =>
                    setFormData({ ...formData, faculty: value })
                  }
                >
                  <SelectTrigger
                    className={
                      errors.faculty ? "border-red-500" : ""
                    }
                  >
                    <SelectValue placeholder="Select your faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {FACULTIES.map((faculty) => (
                      <SelectItem key={faculty} value={faculty}>
                        {faculty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.faculty && (
                  <p className="text-sm text-red-500">
                    {errors.faculty}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfPeople">
                  Number of People
                </Label>
                <Input
                  id="numberOfPeople"
                  type="number"
                  min="1"
                  max="12"
                  placeholder="Enter number of people"
                  value={formData.numberOfPeople}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numberOfPeople: e.target.value,
                    })
                  }
                  className={
                    errors.numberOfPeople
                      ? "border-red-500"
                      : ""
                  }
                />
                {errors.numberOfPeople && (
                  <p className="text-sm text-red-500">
                    {errors.numberOfPeople}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Maximum capacity: 12 people
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">
                      Classroom
                    </p>
                    <p className="font-semibold text-lg">
                      {selectedClassroom?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Date
                    </p>
                    <p className="font-semibold">
                      {new Date(
                        formData.date,
                      ).toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Time
                    </p>
                    <p className="font-semibold">
                      {formData.startTime} - {formData.endTime}{" "}
                      ({calculateDuration()} hours)
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">
                      Faculty
                    </p>
                    <p className="font-semibold">
                      {formData.faculty}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Number of People
                    </p>
                    <p className="font-semibold">
                      {formData.numberOfPeople} people
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Reserved by
                    </p>
                    <p className="font-semibold">
                      {user?.name}
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please review your reservation details
                  carefully before confirming.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {submitError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {submitError}
            </div>
          )}
          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                className="bg-[#2563eb] hover:bg-[#1d4ed8]"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                <Check className="w-4 h-4 mr-2" />
                {loading ? 'Confirmando...' : 'Confirm Reservation'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rules Modal */}
      {selectedClassroom && (
        <RulesModal
          open={showRulesModal}
          onClose={handleModalClose}
          classroomName={selectedClassroom.name}
        />
      )}
    </div>
  );
}