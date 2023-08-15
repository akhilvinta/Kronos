import "./App.css";
import { useState } from "react";
import { Pages } from "./constants";
import Button from "./components/Button";
import SmartScheduler from "./pages/SmartScheduler";
import UploadSyllabus from "./pages/UploadSyllabus";
import AvailabilityAsText from "./pages/AvailabilityAsText";
import ImportCalendar from "./pages/ImportCalendar";

function App() {
  const [page, setPage] = useState(Pages.HOME);

  const goHome = () => {
    setPage(Pages.HOME);
  };

  return (
    <div className="text-lg w-full h-screen pl-2 font-roboto overflow-hidden">
      {page === Pages.HOME && (
        <div className="text-2xl font-bold mb-4 mt-2">Kronos</div>
      )}
      {page === Pages.SMARTSCHEDULER && (
        <SmartScheduler pageCallback={goHome} />
      )}
      {page === Pages.UPLOADSYLLABUS && (
        <UploadSyllabus pageCallback={goHome} />
      )}
      {page === Pages.AVAILABILITYASTEXT && (
        <AvailabilityAsText pageCallback={goHome} />
      )}
      {page === Pages.IMPORTCALENDAR && (
        <ImportCalendar pageCallback={goHome} />
      )}
      {page === Pages.HOME && (
        <>
          <div className="flex gap-4 flex-col italic">
            <HomeEntry
              title={"Smart Scheduler"}
              onClick={() => setPage(Pages.SMARTSCHEDULER)}
              imgUrl={"scheduler.png"}
            />
            <HomeEntry
              title={"Upload Syllabus"}
              onClick={() => setPage(Pages.UPLOADSYLLABUS)}
              imgUrl={"syllabus.png"}
            />
            <HomeEntry
              title={"Availability as Text"}
              onClick={() => setPage(Pages.AVAILABILITYASTEXT)}
              imgUrl={"text.png"}
            />
            <HomeEntry
              title={"Import Calendar"}
              onClick={() => setPage(Pages.IMPORTCALENDAR)}
              imgUrl={"calendar.png"}
            />
          </div>
        </>
      )}
    </div>
  );
}

const HomeEntry = ({ onClick, title, imgUrl }) => {
  return (
    <Button className="flex gap-2 shadow-md p-4" onClick={onClick}>
      <img src={imgUrl} alt={title} className="w-6 h-6" />
      <div>{title}</div>
    </Button>
  );
};

export default App;
