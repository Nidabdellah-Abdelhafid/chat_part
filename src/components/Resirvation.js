import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { URL_BACKEND } from "./api.js";
import { Image } from 'react-bootstrap';
import { NavigateBefore, NavigateNext, SkipNext, SkipPrevious, Visibility } from '@material-ui/icons';
import { BiShare } from "react-icons/bi";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
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

  const preToEnattente = async (id) => {
    try {
      await axios.put(`${URL_BACKEND}/api/reservations/${id}`, {
        data: { etat: "enAttente" },
      });
      fetchReservation();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const preToEncours = async (id) => {
    try {
      await axios.put(`${URL_BACKEND}/api/reservations/${id}`, {
        data: { etat: "enCours" },
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
                <button
                    className="btn btn-sm mr-2"
                    onClick={() => {
                    setSelectedReservation(i);
                    setIsModalOpen(true);
                    }}
                >
                    details <Visibility />
                </button>
                  {i.attributes.etat === "enAttente" && (
                    <button className="btn btn-sm btn-info" onClick={() => paasToenCours(i.id)}>En Cours</button>
                  )}
                  {i.attributes.etat === "enCours" && (
                    <>
                      <button className="btn btn-sm mr-2 btn-success" onClick={() => paasToValid(i.id)}>Validé</button>
                      <button className="btn btn-sm btn-danger" onClick={() => paasToRefuse(i.id)}>Refusé</button>
                      <div className="lg:tooltip" data-tip="Annuler">
                        <button className="btn btn-sm ml-1" onClick={() => preToEnattente(i.id)}><BiShare /></button>
                      </div>

                    </>
                  )}
                  {(i.attributes.etat === "valide" || i.attributes.etat === "refuse") && (
                    <div className="lg:tooltip" data-tip="Annuler">
                        <button className="btn btn-sm" onClick={() => preToEncours(i.id)}><BiShare /></button>
                      </div>
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
            
            {/* <NavigatePrev/> */}
            <NavigateBefore/>
          </button>
          <span className="mx-2">{currentPage}</span>
          <button
            onClick={() => setCurrentPage(prevPage => Math.min(prevPage + 1, Math.ceil(reservations.length / itemsPerPage)))}
            className="btn btn-sm "
          >
            
            {/* <SkipNext/> */}
            <NavigateNext/>
          </button>
        </div>
      </>
    );
  };

  const Modal = ({ isOpen, onClose, reservation }) => {
    if (!isOpen || !reservation) return null;
    console.log(reservation);
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
        
        <div className="bg-white p-2 rounded-lg shadow-lg z-10 w-auto flex">
          <div className="card card-compact bg-base-100 w-96 shadow-xl">
            <figure>
                <img
                src={reservation.attributes.offre?.data.attributes.image}
                alt="Shoes" />
            </figure>
            <div className="card-body">
                <h2 className="card-titl text-lg">{reservation.attributes.offre?.data.attributes.label}</h2>
                <p> {reservation.attributes.destination}</p>
                <h2 className="card-titl text-lg">Etat de la demande</h2>
                <p> {reservation.attributes.etat}</p>
            </div>
        </div>
        <div className="card card-compact bg-base-100 w-auto shadow-xl ml-2">
            <div className="card-body">
                <h2 className="card-title text-lg">Nombre de voyageurs adultes</h2>
                <p> {reservation.attributes.nbr_voyageurs_adultes}</p>
                <h2 className="card-title text-lg">Nombre d’enfants</h2>
                <p> {reservation.attributes.nbr_voyageurs_enfants}</p>
                <h2 className="card-title text-lg">Pourquoi voyagez-vous ?</h2>
                <p> {reservation.attributes.pourquoi_voyagez_vous}</p>
                <h2 className="card-title text-lg">Quand souhaitez-vous partir ?</h2>
                <p> {reservation.attributes.date_partir}</p>
                <h2 className="card-title text-lg">Mes dates sont fixes</h2>
                <p> {reservation.attributes.date_fixe.toString()}</p>
                <h2 className="card-title text-lg">Quelle est la durée de votre séjour ?</h2>
                <p> {reservation.attributes.duree}</p>
                <h2 className="card-title text-lg">durée de mon voyage est non modifiable</h2>
                <p> {reservation.attributes.duree_modifiable.toString()}</p>
                
            </div>
        </div>
        <div className="card card-compact bg-base-100 w-auto shadow-xl ml-2">
            <div className="card-body">
                <h2 className="card-title text-lg">Vous êtes intéressés par quelle catégorie d’hébergement ?</h2>
                <p> {reservation.attributes.categorie_hebergement}</p>
                <h2 className="card-title  text-lg">Choix de cabine</h2>
                <p> {reservation.attributes.cabine}</p>
                <h2 className="card-title text-lg">Quelle expérience vous souhaitez vivre ?</h2>
                <p> {reservation.attributes.experience_souhaitez}</p>
                <h2 className="card-title text-lg"></h2>
                <p></p>
                <h2 className="card-title text-lg"></h2>
                <p></p>
                <h2 className="card-title text-lg"></h2>
                <p></p>
                <div className="flex w-52 flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="skeleton h-24 w-20 shrink-0  mask mask-squircle rounded-full">
                    {imageUser(reservation.attributes?.user?.data?.id)}
                    
                    </div>
                    <div className="flex flex-col gap-4">
                    <div className="skeleton w-auto p-2">{reservation.attributes?.user?.data?.attributes.username}</div>
                    <div className="skeleton w-auto p-2">{reservation.attributes?.user?.data?.attributes.email}</div>
                    </div>
                </div>
                <div className="skeleton h-32 w-full">
                    <p className='text-sm p-3 font-medium'>Pays : {reservation.attributes?.user?.data?.attributes.pays}</p>
                    <p className='text-sm p-3 font-medium'>Telephone : 0{reservation.attributes?.user?.data?.attributes.telephone}</p>
                </div>
                </div>
                
            </div>
        </div>
          
        </div>
        <button className="btn btn-sm btn-circle btn-ghost absolute right-20 top-5 bg-white" onClick={onClose}>✕</button>
      </div>
    );
  };
  

  return (
    <div className="m-5 p-5">
        <h2 className="mb-4">Traitement de la demande du voyage</h2>
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
      <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      reservation={selectedReservation}
    />
    </div>
  );
}

export default Reservation;
