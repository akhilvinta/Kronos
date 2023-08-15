import React, { useState } from "react";
import Header from "../components/Header";
import Container from "./../components/Container";
import Button from "../components/Button";
import getAvailability from "../services/Availability";

const AvailabilityAsText = ({ pageCallback }) => {
  const [availability, setAvailability] = useState([]);
  const [calendar, setCalendar] = useState(null);

  async function handler() {
    await getAvailability(setAvailability, calendar);
  }

  return (
    <div>
      <Header text={"Get Availability"} buttonCallback={pageCallback}></Header>
      <Container>
        <Button className="bg-blue-600 text-white p-8" onClick={handler}>
          Get Availability
        </Button>
        <input
          className="border-b border-black"
          placeholder="Calendar Name (default Primary)"
          type="text"
          value={calendar}
          onChange={(event) => setCalendar(event.target.value)}
        />
        <div>The following is your availability as text: </div>
        <div>
          {availability &&
            availability.map((avail) => (
              <div key={avail} style={{ fontSize: 12 }}>
                {avail}
              </div>
            ))}
        </div>
      </Container>
    </div>
  );
};

export default AvailabilityAsText;
