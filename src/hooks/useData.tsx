import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import React from 'react';
import { DataService } from '../services/dataService';
import {
  Building,
  Floor,
  FloorExit,
  FloorEquipment,
  AssemblyPoint,
  EmergencyContact,
  HazardInstruction,
  HazardType,
  Inspection,
  ChecklistItem,
  Drill,
  SafetyIssue,
  StaffMember,
  ActivityItem,
  User,
  Institution,
} from '../types';

interface DataContextType {
  institution: Institution;
  buildings: Building[];
  floors: Floor[];
  inspections: Inspection[];
  drills: Drill[];
  issues: SafetyIssue[];
  staff: StaffMember[];
  activities: ActivityItem[];
  user: User | null;
  readinessSummary: ReturnType<typeof DataService.getReadinessSummary>;
  refresh: () => void;
  resetToDefaults: () => void;
  createBuilding: (input: Parameters<typeof DataService.createBuilding>[0]) => Building;
  updateBuilding: (id: string, updates: Partial<Building>) => Building | undefined;
  deleteBuilding: (id: string) => boolean;
  addAssemblyPoint: (buildingId: string, ap: Omit<AssemblyPoint, 'id'>) => Building | undefined;
  updateAssemblyPoint: (buildingId: string, apId: string, updates: Partial<AssemblyPoint>) => Building | undefined;
  deleteAssemblyPoint: (buildingId: string, apId: string) => Building | undefined;
  addEmergencyContact: (buildingId: string, contact: Omit<EmergencyContact, 'id'>) => Building | undefined;
  updateEmergencyContact: (buildingId: string, contactId: string, updates: Partial<EmergencyContact>) => Building | undefined;
  deleteEmergencyContact: (buildingId: string, contactId: string) => Building | undefined;
  updateHazardInstruction: (buildingId: string, hazard: HazardType, updates: Partial<HazardInstruction>) => Building | undefined;
  addFloor: (buildingId: string, floorData: Omit<Floor, 'id' | 'buildingId'>) => Floor;
  updateFloor: (id: string, updates: Partial<Floor>) => Floor | undefined;
  deleteFloor: (id: string) => boolean;
  addFloorExit: (floorId: string, exit: Omit<FloorExit, 'id'>) => Floor | undefined;
  updateFloorExit: (floorId: string, exitId: string, updates: Partial<FloorExit>) => Floor | undefined;
  deleteFloorExit: (floorId: string, exitId: string) => Floor | undefined;
  addFloorEquipment: (floorId: string, eq: Omit<FloorEquipment, 'id'>) => Floor | undefined;
  updateFloorEquipment: (floorId: string, eqId: string, updates: Partial<FloorEquipment>) => Floor | undefined;
  deleteFloorEquipment: (floorId: string, eqId: string) => Floor | undefined;
  createInspection: (inspection: Omit<Inspection, 'id' | 'createdAt'>) => Inspection;
  updateInspection: (id: string, updates: Partial<Inspection>) => Inspection | undefined;
  updateChecklistItem: (inspectionId: string, itemId: string, updates: Partial<ChecklistItem>) => Inspection | undefined;
  deleteInspection: (id: string) => boolean;
  createDrill: (drill: Omit<Drill, 'id' | 'code'>) => Drill;
  updateDrill: (id: string, updates: Partial<Drill>) => void;
  deleteDrill: (id: string) => boolean;
  updateDrillCheckin: (drillId: string, checkinId: string, updates: Partial<Drill['floorCheckins'][0]>) => void;
  addDrillObservation: (drillId: string, obs: Omit<Drill['observations'][0], 'id'>) => void;
  createSafetyIssue: (issue: Omit<SafetyIssue, 'id' | 'code' | 'createdAt'>) => SafetyIssue;
  updateSafetyIssue: (id: string, updates: Partial<SafetyIssue>) => void;
  deleteSafetyIssue: (id: string) => boolean;
  resolveSafetyIssue: (id: string, resolutionNote: string) => void;
  verifySafetyIssue: (id: string, verificationNote: string, verifiedBy?: string) => void;
  authenticate: (email: string, password: string) => { success: boolean; user?: User; error?: string };
  loginAsDemoUser: (role?: User['role']) => void;
  logout: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [institution, setInstitution] = useState<Institution>(DataService.getInstitution());
  const [buildings, setBuildings] = useState<Building[]>(DataService.getBuildings());
  const [floors, setFloors] = useState<Floor[]>(DataService.getFloors());
  const [inspections, setInspections] = useState<Inspection[]>(DataService.getInspections());
  const [drills, setDrills] = useState<Drill[]>(DataService.getDrills());
  const [issues, setIssues] = useState<SafetyIssue[]>(DataService.getSafetyIssues());
  const [staff, setStaff] = useState<StaffMember[]>(DataService.getStaff());
  const [activities, setActivities] = useState<ActivityItem[]>(DataService.getActivities());
  const [user, setUser] = useState<User | null>(DataService.getCurrentUser());
  const [readinessSummary, setReadinessSummary] = useState(DataService.getReadinessSummary());

  const refresh = useCallback(() => {
    setInstitution(DataService.getInstitution());
    setBuildings(DataService.getBuildings());
    setFloors(DataService.getFloors());
    setInspections(DataService.getInspections());
    setDrills(DataService.getDrills());
    setIssues(DataService.getSafetyIssues());
    setStaff(DataService.getStaff());
    setActivities(DataService.getActivities());
    setUser(DataService.getCurrentUser());
    setReadinessSummary(DataService.getReadinessSummary());
  }, []);

  const resetToDefaults = useCallback(() => {
    DataService.resetToDefaults();
    refresh();
  }, [refresh]);

  const handleCreateBuilding = useCallback((input: Parameters<typeof DataService.createBuilding>[0]) => {
    const res = DataService.createBuilding(input);
    refresh();
    return res;
  }, [refresh]);

  const handleUpdateBuilding = useCallback((id: string, updates: Partial<Building>) => {
    const res = DataService.updateBuilding(id, updates);
    refresh();
    return res;
  }, [refresh]);

  const handleDeleteBuilding = useCallback((id: string) => {
    const res = DataService.deleteBuilding(id);
    refresh();
    return res;
  }, [refresh]);

  const handleAddAssemblyPoint = useCallback((buildingId: string, ap: Omit<AssemblyPoint, 'id'>) => {
    const res = DataService.addAssemblyPoint(buildingId, ap);
    refresh();
    return res;
  }, [refresh]);

  const handleUpdateAssemblyPoint = useCallback((buildingId: string, apId: string, updates: Partial<AssemblyPoint>) => {
    const res = DataService.updateAssemblyPoint(buildingId, apId, updates);
    refresh();
    return res;
  }, [refresh]);

  const handleDeleteAssemblyPoint = useCallback((buildingId: string, apId: string) => {
    const res = DataService.deleteAssemblyPoint(buildingId, apId);
    refresh();
    return res;
  }, [refresh]);

  const handleAddEmergencyContact = useCallback((buildingId: string, contact: Omit<EmergencyContact, 'id'>) => {
    const res = DataService.addEmergencyContact(buildingId, contact);
    refresh();
    return res;
  }, [refresh]);

  const handleUpdateEmergencyContact = useCallback((buildingId: string, contactId: string, updates: Partial<EmergencyContact>) => {
    const res = DataService.updateEmergencyContact(buildingId, contactId, updates);
    refresh();
    return res;
  }, [refresh]);

  const handleDeleteEmergencyContact = useCallback((buildingId: string, contactId: string) => {
    const res = DataService.deleteEmergencyContact(buildingId, contactId);
    refresh();
    return res;
  }, [refresh]);

  const handleUpdateHazardInstruction = useCallback((buildingId: string, hazard: HazardType, updates: Partial<HazardInstruction>) => {
    const res = DataService.updateHazardInstruction(buildingId, hazard, updates);
    refresh();
    return res;
  }, [refresh]);

  const handleAddFloor = useCallback((buildingId: string, floorData: Omit<Floor, 'id' | 'buildingId'>) => {
    const res = DataService.addFloor(buildingId, floorData);
    refresh();
    return res;
  }, [refresh]);

  const handleUpdateFloor = useCallback((id: string, updates: Partial<Floor>) => {
    const res = DataService.updateFloor(id, updates);
    refresh();
    return res;
  }, [refresh]);

  const handleDeleteFloor = useCallback((id: string) => {
    const res = DataService.deleteFloor(id);
    refresh();
    return res;
  }, [refresh]);

  const handleAddFloorExit = useCallback((floorId: string, exit: Omit<FloorExit, 'id'>) => {
    const res = DataService.addFloorExit(floorId, exit);
    refresh();
    return res;
  }, [refresh]);

  const handleUpdateFloorExit = useCallback((floorId: string, exitId: string, updates: Partial<FloorExit>) => {
    const res = DataService.updateFloorExit(floorId, exitId, updates);
    refresh();
    return res;
  }, [refresh]);

  const handleDeleteFloorExit = useCallback((floorId: string, exitId: string) => {
    const res = DataService.deleteFloorExit(floorId, exitId);
    refresh();
    return res;
  }, [refresh]);

  const handleAddFloorEquipment = useCallback((floorId: string, eq: Omit<FloorEquipment, 'id'>) => {
    const res = DataService.addFloorEquipment(floorId, eq);
    refresh();
    return res;
  }, [refresh]);

  const handleUpdateFloorEquipment = useCallback((floorId: string, eqId: string, updates: Partial<FloorEquipment>) => {
    const res = DataService.updateFloorEquipment(floorId, eqId, updates);
    refresh();
    return res;
  }, [refresh]);

  const handleDeleteFloorEquipment = useCallback((floorId: string, eqId: string) => {
    const res = DataService.deleteFloorEquipment(floorId, eqId);
    refresh();
    return res;
  }, [refresh]);

  const handleCreateInspection = useCallback((inspection: Omit<Inspection, 'id' | 'createdAt'>) => {
    const res = DataService.createInspection(inspection);
    refresh();
    return res;
  }, [refresh]);

  const handleUpdateInspection = useCallback((id: string, updates: Partial<Inspection>) => {
    const res = DataService.updateInspection(id, updates);
    refresh();
    return res;
  }, [refresh]);

  const handleUpdateChecklistItem = useCallback((inspectionId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    const res = DataService.updateChecklistItem(inspectionId, itemId, updates);
    refresh();
    return res;
  }, [refresh]);

  const handleDeleteInspection = useCallback((id: string) => {
    const res = DataService.deleteInspection(id);
    refresh();
    return res;
  }, [refresh]);

  const handleCreateDrill = useCallback((drill: Omit<Drill, 'id' | 'code'>) => {
    const res = DataService.createDrill(drill);
    refresh();
    return res;
  }, [refresh]);

  const handleUpdateDrill = useCallback((id: string, updates: Partial<Drill>) => {
    DataService.updateDrill(id, updates);
    refresh();
  }, [refresh]);

  const handleDeleteDrill = useCallback((id: string) => {
    const res = DataService.deleteDrill(id);
    refresh();
    return res;
  }, [refresh]);

  const handleUpdateDrillCheckin = useCallback((drillId: string, checkinId: string, updates: Partial<Drill['floorCheckins'][0]>) => {
    DataService.updateDrillCheckin(drillId, checkinId, updates);
    refresh();
  }, [refresh]);

  const handleAddDrillObservation = useCallback((drillId: string, obs: Omit<Drill['observations'][0], 'id'>) => {
    DataService.addDrillObservation(drillId, obs);
    refresh();
  }, [refresh]);

  const handleCreateSafetyIssue = useCallback((issue: Omit<SafetyIssue, 'id' | 'code' | 'createdAt'>) => {
    const res = DataService.createSafetyIssue(issue);
    refresh();
    return res;
  }, [refresh]);

  const handleUpdateSafetyIssue = useCallback((id: string, updates: Partial<SafetyIssue>) => {
    DataService.updateSafetyIssue(id, updates);
    refresh();
  }, [refresh]);

  const handleDeleteSafetyIssue = useCallback((id: string) => {
    const res = DataService.deleteSafetyIssue(id);
    refresh();
    return res;
  }, [refresh]);

  const handleResolveSafetyIssue = useCallback((id: string, resolutionNote: string) => {
    const actor = user?.name || 'Authorized Lead';
    DataService.resolveSafetyIssue(id, resolutionNote, actor);
    refresh();
  }, [refresh, user]);

  const handleVerifySafetyIssue = useCallback((id: string, verificationNote: string, verifiedBy?: string) => {
    const actor = verifiedBy || user?.name || 'Marcus Vance';
    DataService.verifySafetyIssue(id, verificationNote, actor);
    refresh();
  }, [refresh, user]);

  const handleAuthenticate = useCallback(
    (email: string, password: string) => {
      const res = DataService.authenticate(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        refresh();
      }
      return res;
    },
    [refresh]
  );

  const handleLoginAsDemoUser = useCallback((role: User['role'] = 'admin') => {
    const loggedIn = DataService.loginAsDemoUser(role);
    setUser(loggedIn);
    refresh();
  }, [refresh]);

  const handleLogout = useCallback(() => {
    DataService.logout();
    setUser(null);
    refresh();
  }, [refresh]);

  return (
    <DataContext.Provider
      value={{
        institution,
        buildings,
        floors,
        inspections,
        drills,
        issues,
        staff,
        activities,
        user,
        readinessSummary,
        refresh,
        resetToDefaults,
        createBuilding: handleCreateBuilding,
        updateBuilding: handleUpdateBuilding,
        deleteBuilding: handleDeleteBuilding,
        addAssemblyPoint: handleAddAssemblyPoint,
        updateAssemblyPoint: handleUpdateAssemblyPoint,
        deleteAssemblyPoint: handleDeleteAssemblyPoint,
        addEmergencyContact: handleAddEmergencyContact,
        updateEmergencyContact: handleUpdateEmergencyContact,
        deleteEmergencyContact: handleDeleteEmergencyContact,
        updateHazardInstruction: handleUpdateHazardInstruction,
        addFloor: handleAddFloor,
        updateFloor: handleUpdateFloor,
        deleteFloor: handleDeleteFloor,
        addFloorExit: handleAddFloorExit,
        updateFloorExit: handleUpdateFloorExit,
        deleteFloorExit: handleDeleteFloorExit,
        addFloorEquipment: handleAddFloorEquipment,
        updateFloorEquipment: handleUpdateFloorEquipment,
        deleteFloorEquipment: handleDeleteFloorEquipment,
        createInspection: handleCreateInspection,
        updateInspection: handleUpdateInspection,
        updateChecklistItem: handleUpdateChecklistItem,
        deleteInspection: handleDeleteInspection,
        createDrill: handleCreateDrill,
        updateDrill: handleUpdateDrill,
        deleteDrill: handleDeleteDrill,
        updateDrillCheckin: handleUpdateDrillCheckin,
        addDrillObservation: handleAddDrillObservation,
        createSafetyIssue: handleCreateSafetyIssue,
        updateSafetyIssue: handleUpdateSafetyIssue,
        deleteSafetyIssue: handleDeleteSafetyIssue,
        resolveSafetyIssue: handleResolveSafetyIssue,
        verifySafetyIssue: handleVerifySafetyIssue,
        authenticate: handleAuthenticate,
        loginAsDemoUser: handleLoginAsDemoUser,
        logout: handleLogout,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
