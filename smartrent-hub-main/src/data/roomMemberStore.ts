export interface RoomMember {
  id: string;
  roomId: string;
  name: string;
  cccd: string;
  phone: string;
  dob: string;
  hometown: string;
  relation: string;
  moveInDate: string;
  moveOutDate?: string;
  cccdFront?: string;
  cccdBack?: string;
}

let _members: RoomMember[] = [];

export const getMembersByRoom = (roomId: string) => _members.filter(m => m.roomId === roomId);
export const addMember = (m: RoomMember) => { _members = [..._members, m]; };
export const updateMember = (id: string, data: Partial<RoomMember>) => {
  _members = _members.map(m => m.id === id ? { ...m, ...data } : m);
};
export const deleteMember = (id: string) => { _members = _members.filter(m => m.id !== id); };
