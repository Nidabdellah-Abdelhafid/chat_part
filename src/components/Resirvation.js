import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { URL_BACKEND } from "./api.js";
import { Image } from 'react-bootstrap';
import { SkipNext, SkipPrevious, Visibility } from '@material-ui/icons';

function Reservation() {
  const [reservation, setReservation] = useState(null);
  const [userDC, setUserDC] = useState([]);
  const [filteredReservationsEnAttente, setFilteredReservationsEnAttente] = useState([]);
  const [filteredReservationsEnCours, setFilteredReservationsEnCours] = useState([]);
  const [filteredReservationsValide, setFilteredReservationsValide] = useState([]);
  const [filteredReservationsRefuse, setFilteredReservationsRefuse] = useState([]);

  // Pagination states
  const [currentPageEnAttente, setCurrentPageEnAttente] = useState(1);
  const [currentPageEnCours, setCurrentPageEnCours] = useState(1);
  const [currentPageValide, setCurrentPageValide] = useState(1);
  const [currentPageRefuse, setCurrentPageRefuse] = useState(1);
  const itemsPerPage = 5; // Number of items per page

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${URL_BACKEND}/api/users?populate=*&pagination[limit]=-1`);
      const users = response.data;
      setUserDC(users);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!reservation) {
      fetchReservation();
    }
  }, [reservation]);

  const fetchReservation = async () => {
    try {
      const response = await axios.get(`${URL_BACKEND}/api/reservations?populate=*&pagination[limit]=-1`);
      const reservations = response.data.data;
      setReservation(reservations);
    //   console.log(reservations)

      setFilteredReservationsEnAttente(reservations?.filter(reservation => reservation.attributes.etat === "enAttente"));
      setFilteredReservationsEnCours(reservations?.filter(reservation => reservation.attributes.etat === "enCours"));
      setFilteredReservationsValide(reservations?.filter(reservation => reservation.attributes.etat === "valide"));
      setFilteredReservationsRefuse(reservations?.filter(reservation => reservation.attributes.etat === "refuse"));
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const imageUser = (userId) => {
    const currentUserData = userDC?.find(user => user.id === userId);
    return (
      <Image
        src={currentUserData?.image && currentUserData?.image.url ? `${URL_BACKEND}${currentUserData?.image.url}` : 'https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/75/cc/7c/75cc7cf2-516f-b0f4-a8ed-3baccc1abcbf/source/512x512bb.jpg'}
        alt={currentUserData?.username}
      />
    );
  };

  const paasToenCours = async (id) => {
    try {
      await axios.put(`${URL_BACKEND}/api/reservations/${id}`, {
        data: { etat: "enCours" },
      });
      fetchReservation();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const paasToValid = async (id) => {
    try {
      await axios.put(`${URL_BACKEND}/api/reservations/${id}`, {
        data: { etat: "valide" },
      });
      fetchReservation();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const paasToRefuse = async (id) => {
    try {
      await axios.put(`${URL_BACKEND}/api/reservations/${id}`, {
        data: { etat: "refuse" },
      });
      fetchReservation();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  // Helper function for rendering a table with pagination
  const renderTable = (reservations, currentPage, setCurrentPage) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = reservations.slice(indexOfFirstItem, indexOfLastItem);

    return (
      <>
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Select</th>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Destination</th>
              <th className="px-4 py-2">Offre</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((i, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">
                  <input type="checkbox" className="checkbox" />
                </td>
                <td className="border px-4 py-2">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-squircle h-12 w-12">
                        {imageUser(i.attributes?.user?.data?.id)}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">{i.attributes?.user?.data?.attributes.username}</div>
                      <div className="text-sm opacity-50">{i.attributes?.user?.data?.attributes.email}</div>
                    </div>
                  </div>
                </td>
                <td className="border px-4 py-2">{i.attributes.destination}</td>
                <td className="border px-4 py-2">{i.attributes?.offre?.data.attributes.label}</td>
                <td className="border px-4 py-2">
                  <button className="btn btn-sm mr-2">details <Visibility /></button>
                  {i.attributes.etat === "enAttente" && (
                    <button className="btn btn-sm btn-info" onClick={() => paasToenCours(i.id)}>En Cours</button>
                  )}
                  {i.attributes.etat === "enCours" && (
                    <>
                      <button className="btn btn-sm mr-2 btn-success" onClick={() => paasToValid(i.id)}>Validé</button>
                      <button className="btn btn-sm btn-danger" onClick={() => paasToRefuse(i.id)}>Refusé</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-center mt-4">
          <button
            onClick={() => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))}
            className="btn btn-sm "
          >
            
            <SkipPrevious/>
          </button>
          <span className="mx-2">{currentPage}</span>
          <button
            onClick={() => setCurrentPage(prevPage => Math.min(prevPage + 1, Math.ceil(reservations.length / itemsPerPage)))}
            className="btn btn-sm "
          >
            
            <SkipNext/>
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="m-5 p-5">
      <div role="tablist" className="tabs tabs-lifted">
        <input type="radio" name="my_tabs_2" role="tab" className="tab" aria-label="En attente" defaultChecked />
        <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
          <div className="overflow-x-auto">
            {renderTable(filteredReservationsEnAttente, currentPageEnAttente, setCurrentPageEnAttente)}
          </div>
        </div>

        <input type="radio" name="my_tabs_2" role="tab" className="tab" aria-label="En cours" />
        <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
          <div className="overflow-x-auto">
            {renderTable(filteredReservationsEnCours, currentPageEnCours, setCurrentPageEnCours)}
          </div>
        </div>

        <input type="radio" name="my_tabs_2" role="tab" className="tab" aria-label="Validé" />
        <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
          <div className="overflow-x-auto">
            {renderTable(filteredReservationsValide, currentPageValide, setCurrentPageValide)}
          </div>
        </div>

        <input type="radio" name="my_tabs_2" role="tab" className="tab" aria-label="Refusé" />
        <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
          <div className="overflow-x-auto">
            {renderTable(filteredReservationsRefuse, currentPageRefuse, setCurrentPageRefuse)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reservation;
