import { useState } from "react";

type AssignmentType =
  | "Project"
  | "Base Service"
  | "Charge On"
  | "Internal Initiative";

type Period = {
  id: number;
  startWeek: number;
  endWeek: number;
  allocationPercent: number;
};

type Assignment = {
  id: number;
  name: string;
  team: string;
  country: string;
  skillset: string;
  level: string;
  type: AssignmentType;
  workName: string;
  projectId: number | null;
  periods: Period[];
  confirmed: boolean;
  confirmedBy: string | null;
};

type Project = {
  id: number;
  name: string;
  projectManager: string;
};

const weeks = Array.from({ length: 52 }, (_, index) => index + 1);

const initialBaseServices = [
  { name: "Integration Support", team: "Platform" },
  { name: "Infrastructure Support", team: "Platform" },
  { name: "Cloud Operations", team: "Platform" },
  { name: "Application Support", team: "Development" },
  { name: "Bug Fixing", team: "Development" },
  { name: "Maintenance", team: "Development" },
  { name: "PMO Governance", team: "PMO" },
  { name: "Reporting", team: "PMO" },
];

const cellStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: 8,
  textAlign: "left",
  whiteSpace: "nowrap",
};

export default function App() {
  const [role, setRole] = useState("Teamlead");
  const [userName, setUserName] = useState("Martina Vallgren");

  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [baseServices, setBaseServices] = useState(initialBaseServices);

  const [projectName, setProjectName] = useState("");
  const [projectManager, setProjectManager] = useState("");

  const [newBaseServiceName, setNewBaseServiceName] = useState("");
  const [baseServiceTeam, setBaseServiceTeam] = useState("Development");

  const [name, setName] = useState("");
  const [team, setTeam] = useState("Development");
  const [country, setCountry] = useState("Sverige");
  const [skillset, setSkillset] = useState("");
  const [level, setLevel] = useState("Junior");

  const [assignmentType, setAssignmentType] =
    useState<AssignmentType>("Project");

  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
  const [selectedBaseService, setSelectedBaseService] = useState("");
  const [workName, setWorkName] = useState("");

  const [startWeek, setStartWeek] = useState(1);
  const [endWeek, setEndWeek] = useState(3);
  const [allocationPercent, setAllocationPercent] = useState(80);

  function addProject() {
    if (!projectName.trim()) return;

    setProjects([
      ...projects,
      {
        id: Date.now(),
        name: projectName,
        projectManager,
      },
    ]);

    setProjectName("");
    setProjectManager("");
  }

  function addBaseService() {
    if (!newBaseServiceName.trim()) return;

    setBaseServices([
      ...baseServices,
      {
        name: newBaseServiceName,
        team: baseServiceTeam,
      },
    ]);

    setNewBaseServiceName("");
  }

  function updateBaseService(oldName: string, newName: string) {
    if (!newName.trim()) return;

    setBaseServices(
      baseServices.map((service) =>
        service.name === oldName ? { ...service, name: newName } : service
      )
    );
  }

  function deleteBaseService(nameToDelete: string) {
    setBaseServices(
      baseServices.filter((service) => service.name !== nameToDelete)
    );
  }

  function getAssignmentWorkName() {
    if (assignmentType === "Project") {
      const project = projects.find((p) => p.id === selectedProjectId);
      return project ? project.name : "";
    }

    if (assignmentType === "Base Service") {
      return selectedBaseService;
    }

    return workName;
  }

  function addAssignment() {
    if (!name.trim()) return;
    if (!skillset.trim()) return;

    if (assignmentType === "Project" && selectedProjectId === "") return;
    if (assignmentType === "Base Service" && !selectedBaseService) return;
    if (
      (assignmentType === "Charge On" ||
        assignmentType === "Internal Initiative") &&
      !workName.trim()
    ) {
      return;
    }

    const finalWorkName = getAssignmentWorkName();

    const existingAssignment = assignments.find(
      (assignment) =>
        assignment.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        assignment.type === assignmentType &&
        assignment.workName.trim().toLowerCase() ===
          finalWorkName.trim().toLowerCase()
    );

    const newPeriod: Period = {
      id: Date.now(),
      startWeek,
      endWeek,
      allocationPercent,
    };

    if (existingAssignment) {
      setAssignments(
        assignments.map((assignment) =>
          assignment.id === existingAssignment.id
            ? {
                ...assignment,
                periods: [...assignment.periods, newPeriod],
                confirmed: false,
                confirmedBy: null,
              }
            : assignment
        )
      );
    } else {
      setAssignments([
        ...assignments,
        {
          id: Date.now(),
          name,
          team,
          country,
          skillset,
          level,
          type: assignmentType,
          workName: finalWorkName,
          projectId:
            assignmentType === "Project" ? Number(selectedProjectId) : null,
          periods: [newPeriod],
          confirmed: false,
          confirmedBy: null,
        },
      ]);
    }

    setName("");
    setSkillset("");
    setSelectedProjectId("");
    setSelectedBaseService("");
    setWorkName("");
    setStartWeek(1);
    setEndWeek(3);
    setAllocationPercent(80);
  }

  function addPeriod(assignmentId: number) {
    const newPeriod: Period = {
      id: Date.now(),
      startWeek,
      endWeek,
      allocationPercent,
    };

    setAssignments(
      assignments.map((assignment) =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              periods: [...assignment.periods, newPeriod],
              confirmed: false,
              confirmedBy: null,
            }
          : assignment
      )
    );
  }

  function confirmAssignment(id: number) {
    setAssignments(
      assignments.map((assignment) =>
        assignment.id === id
          ? {
              ...assignment,
              confirmed: true,
              confirmedBy: userName,
            }
          : assignment
      )
    );
  }

  function deleteAssignment(id: number) {
    setAssignments(assignments.filter((assignment) => assignment.id !== id));
  }

  function deletePeriod(assignmentId: number, periodId: number) {
    setAssignments(
      assignments.map((assignment) =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              periods: assignment.periods.filter(
                (period) => period.id !== periodId
              ),
              confirmed: false,
              confirmedBy: null,
            }
          : assignment
      )
    );
  }

  function getAllocationForWeek(assignment: Assignment, week: number) {
    return assignment.periods
      .filter((period) => week >= period.startWeek && week <= period.endWeek)
      .reduce((total, period) => total + period.allocationPercent, 0);
  }

  function visibleAssignments() {
    return assignments.filter((assignment) => {
      if (role === "Teammedlem" && !assignment.confirmed) return false;
      return true;
    });
  }

  function getPeople() {
    const peopleMap = new Map<string, Assignment>();

    visibleAssignments().forEach((assignment) => {
      const key = assignment.name.toLowerCase();
      if (!peopleMap.has(key)) {
        peopleMap.set(key, assignment);
      }
    });

    return Array.from(peopleMap.values());
  }

  function getTotalAllocationForPerson(personName: string, week: number) {
    return visibleAssignments()
      .filter(
        (assignment) =>
          assignment.name.toLowerCase() === personName.toLowerCase()
      )
      .reduce(
        (total, assignment) => total + getAllocationForWeek(assignment, week),
        0
      );
  }

  function countryColor(country: string) {
    return country === "Sverige" ? "#dbeafe" : "#fef3c7";
  }

  function allocationColor(total: number) {
    if (total > 100) return "#fecaca";
    if (total === 100) return "#dcfce7";
    if (total > 0) return "#fef9c3";
    return "white";
  }

  const filteredBaseServices = baseServices.filter(
    (service) => service.team === team
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f8", padding: 24, fontFamily: "Arial" }}>
      <div style={{ maxWidth: 1500, margin: "0 auto" }}>
        <h1>Resource Planner</h1>

        <div style={{ background: "white", padding: 16, borderRadius: 12 }}>
          <label>Roll</label>
          <br />
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: 8 }}>
            <option>Teamlead</option>
            <option>Projektledare</option>
            <option>Teammedlem</option>
            <option>Chef</option>
          </select>

          <br />
          <br />

          <label>Ditt namn</label>
          <br />
          <input value={userName} onChange={(e) => setUserName(e.target.value)} style={{ padding: 8 }} />
        </div>

        {(role === "Teamlead" || role === "Chef") && (
          <>
            <div style={{ background: "white", padding: 16, borderRadius: 12, marginTop: 20 }}>
              <h2>Hantera Base Services</h2>

              <select
                value={baseServiceTeam}
                onChange={(e) => setBaseServiceTeam(e.target.value)}
                style={{ padding: 8, marginRight: 8 }}
              >
                <option>Development</option>
                <option>Platform</option>
                <option>PMO</option>
              </select>

              <input
                placeholder="Ny Base Service"
                value={newBaseServiceName}
                onChange={(e) => setNewBaseServiceName(e.target.value)}
                style={{ padding: 8, marginRight: 8 }}
              />

              <button onClick={addBaseService} style={{ padding: 8 }}>
                Lägg till Base Service
              </button>

              <h3>Bastjänster för {baseServiceTeam}</h3>

              {baseServices
                .filter((service) => service.team === baseServiceTeam)
                .map((service) => (
                  <div key={service.name} style={{ marginBottom: 8 }}>
                    {service.name}

                    <button
                      onClick={() => {
                        const newName = prompt("Nytt namn:", service.name);
                        if (newName) updateBaseService(service.name, newName);
                      }}
                      style={{ marginLeft: 8 }}
                    >
                      Ändra
                    </button>

                    <button
                      onClick={() => deleteBaseService(service.name)}
                      style={{ marginLeft: 8 }}
                    >
                      Ta bort
                    </button>
                  </div>
                ))}
            </div>

            <div style={{ background: "white", padding: 16, borderRadius: 12, marginTop: 20 }}>
              <h2>Lägg till projekt</h2>

              <input
                placeholder="Projektnamn"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                style={{ padding: 8, marginRight: 8 }}
              />

              <input
                placeholder="Projektledare"
                value={projectManager}
                onChange={(e) => setProjectManager(e.target.value)}
                style={{ padding: 8, marginRight: 8 }}
              />

              <button onClick={addProject} style={{ padding: 8 }}>
                Lägg till projekt
              </button>
            </div>

            <div style={{ background: "white", padding: 16, borderRadius: 12, marginTop: 20 }}>
              <h2>Lägg till planering</h2>

              <select
                value={assignmentType}
                onChange={(e) => {
                  setAssignmentType(e.target.value as AssignmentType);
                  setSelectedProjectId("");
                  setSelectedBaseService("");
                  setWorkName("");
                }}
                style={{ padding: 8, marginRight: 8, marginBottom: 8 }}
              >
                <option value="Project">Project</option>
                <option value="Base Service">Base Service</option>
                <option value="Charge On">Charge On</option>
                <option value="Internal Initiative">Internal Initiative</option>
              </select>

              <input placeholder="Namn" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 8, marginRight: 8 }} />

              <select
                value={team}
                onChange={(e) => {
                  setTeam(e.target.value);
                  setSelectedBaseService("");
                }}
                style={{ padding: 8, marginRight: 8 }}
              >
                <option>Development</option>
                <option>Platform</option>
                <option>PMO</option>
              </select>

              <select value={country} onChange={(e) => setCountry(e.target.value)} style={{ padding: 8, marginRight: 8 }}>
                <option>Sverige</option>
                <option>Polen</option>
              </select>

              <input placeholder="Skillset" value={skillset} onChange={(e) => setSkillset(e.target.value)} style={{ padding: 8, marginRight: 8 }} />

              <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ padding: 8, marginRight: 8 }}>
                <option>Junior</option>
                <option>Mid</option>
                <option>Senior</option>
              </select>

              {assignmentType === "Project" && (
                <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(Number(e.target.value))} style={{ padding: 8, marginRight: 8 }}>
                  <option value="">Välj projekt</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              )}

              {assignmentType === "Base Service" && (
                <select value={selectedBaseService} onChange={(e) => setSelectedBaseService(e.target.value)} style={{ padding: 8, marginRight: 8 }}>
                  <option value="">Välj bastjänst</option>
                  {filteredBaseServices.map((service) => (
                    <option key={service.name} value={service.name}>
                      {service.name}
                    </option>
                  ))}
                </select>
              )}

              {(assignmentType === "Charge On" || assignmentType === "Internal Initiative") && (
                <input placeholder="Namn på arbete" value={workName} onChange={(e) => setWorkName(e.target.value)} style={{ padding: 8, marginRight: 8 }} />
              )}

              <br />
              <br />

              <span>Period: vecka </span>
              <input type="number" value={startWeek} onChange={(e) => setStartWeek(Number(e.target.value))} style={{ padding: 8, width: 70 }} />

              <span> till </span>

              <input type="number" value={endWeek} onChange={(e) => setEndWeek(Number(e.target.value))} style={{ padding: 8, width: 70 }} />

              <span> Beläggning </span>

              <input type="number" value={allocationPercent} onChange={(e) => setAllocationPercent(Number(e.target.value))} style={{ padding: 8, width: 70 }} />
              %

              <button onClick={addAssignment} style={{ padding: 8, marginLeft: 8 }}>
                Lägg till planering
              </button>
            </div>
          </>
        )}

        <div style={{ background: "white", padding: 16, borderRadius: 12, marginTop: 20 }}>
          <h2>Total beläggning per person</h2>

          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", minWidth: 2200 }}>
              <thead>
                <tr>
                  <th style={cellStyle}>Person</th>
                  <th style={cellStyle}>Team</th>
                  <th style={cellStyle}>Land</th>
                  <th style={cellStyle}>Skill</th>
                  <th style={cellStyle}>Level</th>
                  {weeks.map((week) => (
                    <th key={week} style={cellStyle}>v{week}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {getPeople().length === 0 ? (
                  <tr>
                    <td style={cellStyle} colSpan={57}>Ingen synlig beläggning.</td>
                  </tr>
                ) : (
                  getPeople().map((person) => (
                    <tr key={person.name}>
                      <td style={{ ...cellStyle, background: countryColor(person.country), fontWeight: "bold" }}>
                        {role === "Projektledare" &&
                        visibleAssignments().some((a) => a.name === person.name && !a.confirmed)
                          ? "Planerad resurs"
                          : person.name}
                      </td>
                      <td style={cellStyle}>{person.team}</td>
                      <td style={cellStyle}>{person.country}</td>
                      <td style={cellStyle}>{person.skillset}</td>
                      <td style={cellStyle}>{person.level}</td>

                      {weeks.map((week) => {
                        const total = getTotalAllocationForPerson(person.name, week);
                        return (
                          <td key={week} style={{ ...cellStyle, background: allocationColor(total), fontWeight: total > 100 ? "bold" : "normal" }}>
                            {total > 0 ? `${total}%` : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ background: "white", padding: 16, borderRadius: 12, marginTop: 20 }}>
          <h2>Detaljerad planering</h2>

          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", minWidth: 2500 }}>
              <thead>
                <tr>
                  <th style={cellStyle}>Resurs</th>
                  <th style={cellStyle}>Team</th>
                  <th style={cellStyle}>Land</th>
                  <th style={cellStyle}>Skill</th>
                  <th style={cellStyle}>Level</th>
                  <th style={cellStyle}>Assignment Type</th>
                  <th style={cellStyle}>Arbete</th>
                  {weeks.map((week) => (
                    <th key={week} style={cellStyle}>v{week}</th>
                  ))}
                  <th style={cellStyle}>Status</th>
                  <th style={cellStyle}>Perioder</th>
                </tr>
              </thead>

              <tbody>
                {visibleAssignments().length === 0 ? (
                  <tr>
                    <td style={cellStyle} colSpan={62}>Ingen synlig planering.</td>
                  </tr>
                ) : (
                  visibleAssignments().map((assignment) => {
                    const displayName =
                      !assignment.confirmed && role === "Projektledare"
                        ? "Planerad resurs"
                        : assignment.name;

                    return (
                      <tr key={assignment.id}>
                        <td style={{ ...cellStyle, background: countryColor(assignment.country) }}>
                          {displayName}
                        </td>
                        <td style={cellStyle}>{assignment.team}</td>
                        <td style={cellStyle}>{assignment.country}</td>
                        <td style={cellStyle}>{assignment.skillset}</td>
                        <td style={cellStyle}>{assignment.level}</td>
                        <td style={cellStyle}>{assignment.type}</td>
                        <td style={cellStyle}>{assignment.workName}</td>

                        {weeks.map((week) => {
                          const allocation = getAllocationForWeek(assignment, week);
                          return (
                            <td key={week} style={cellStyle}>
                              {allocation > 0 ? `${allocation}%` : "-"}
                            </td>
                          );
                        })}

                        <td style={cellStyle}>
                          {assignment.confirmed ? (
                            <>
                              <strong>Bekräftad</strong>
                              <br />
                              av {assignment.confirmedBy}
                            </>
                          ) : (
                            <strong>Planerad</strong>
                          )}

                          {!assignment.confirmed && (role === "Teamlead" || role === "Chef") && (
                            <>
                              <br />
                              <button onClick={() => confirmAssignment(assignment.id)}>Bekräfta</button>
                            </>
                          )}
                        </td>

                        <td style={cellStyle}>
                          {assignment.periods.map((period) => (
                            <div key={period.id}>
                              v{period.startWeek}-{period.endWeek}: {period.allocationPercent}%
                              {(role === "Teamlead" || role === "Chef") && (
                                <button onClick={() => deletePeriod(assignment.id, period.id)} style={{ marginLeft: 6 }}>
                                  Ta bort period
                                </button>
                              )}
                            </div>
                          ))}

                          {(role === "Teamlead" || role === "Chef") && (
                            <>
                              <button onClick={() => addPeriod(assignment.id)} style={{ marginTop: 8 }}>
                                Lägg till period med fälten ovan
                              </button>

                              <br />

                              <button onClick={() => deleteAssignment(assignment.id)} style={{ marginTop: 8 }}>
                                Ta bort planering
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
