'use client'
import { useState, useEffect } from 'react'
import EnvironmentsList from "@/components/Environment/EnvironmentsList"
import { Environment, Team } from '@/types/User'
import { useUserData } from '@/hooks/useUserData'
import { Variable } from '@/types/Collections'
import EnvironmentSettings from '@/components/Environment/EnvironmentSettings'
import VariableTable from '@/components/Environment/VariableTable'
import AddEnvironmentModal from '@/components/Environment/EnvironmentModal'
import { updatePersonalEnvironments } from '@/lib/firebase/userDataHelpers'
import { getInitials, getUserDetails } from '@/lib/firebase/auth'
import { savePersonalEnvironments } from '@/lib/firebase/environments'
import HeaderComponent from '@/components/Common/Header'
import { getUserTeams, updateTeamEnvironments } from '@/lib/firebase/teams'

/* eslint-disable @typescript-eslint/no-unused-vars */

const colorOptions = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Gray', value: '#6b7280' }
]

export default function Environments() {
    const { userData, teamId, updateUserData } = useUserData()
    const [environments, setEnvironments] = useState<Environment[]>([])
    const [activeEnvironment, setActiveEnvironment] = useState<Environment | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState<Partial<Environment>>({})
    const [showShareModal, setShowShareModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [userid, setUserid] = useState<string | undefined>(undefined);
    const [autoSave, setAutoSave] = useState<boolean>(true);
    const [displayName, setDisplayName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [photoURL, setPhotoURL] = useState<string>('');
    const [initials, setInitials] = useState<string>('');
    const [teams, setTeams] = useState<Team[]>([]);
    const [teamMode, setTeamMode] = useState<Team | null>(null);
    const [showTeamsDropdown, setShowTeamsDropdown] = useState(false);

    // Add this useEffect to initialize team mode and environment from localStorage
    useEffect(() => {
        const savedTeamMode = localStorage.getItem('teamMode');

        if (savedTeamMode) {
            setTeamMode(JSON.parse(savedTeamMode));
        }
    }, []);

    // Initialize environments from userData
    useEffect(() => {
        const fetchUserData = async () => {
            const { user, userData } = await getUserDetails();
            const teams = await getUserTeams(user?.uid || '');
            setUserid(user?.uid);
            setEmail(user?.email || '');
            setAutoSave(userData?.autoSave || true);
            setDisplayName(user?.displayName || '');
            setUsername(user?.username || '');
            setInitials(getInitials(user?.displayName || ''));
            setPhotoURL(user?.photoURL || '');
            setTeams(teams);
        }
        fetchUserData();
        if (userData) {
            const personalEnvironments = !teamMode ? userData.personalEnvironments || [] : teamMode.environments || [];
            setEnvironments(personalEnvironments);
            if (personalEnvironments.length > 0 && !activeEnvironment) {
                setActiveEnvironment(personalEnvironments[0])
            }
        }
    }, [userData, teamId]);

    const handleEnvironmentSelect = (envId: string) => {
        const env = environments.find(e => e.id === envId)
        if (env) {
            setActiveEnvironment(env)
            setIsEditing(false)
            setEditForm({})
        }
    }

    const handleEnvironmentAdd = async (newEnv: Environment) => {
        const updatedEnvs = [...environments, newEnv];
        const { user } = await getUserDetails();
        setEnvironments(updatedEnvs);
        setActiveEnvironment(newEnv);

        if (teamMode) {
            const intermediateTeamMode = { ...teamMode, environments: updatedEnvs };
            setTeamMode(intermediateTeamMode);
            updateTeamEnvironments(teamMode.teamId, updatedEnvs);
        }

        if (userData && !teamMode) {
            const updatedData = updatePersonalEnvironments(userData, updatedEnvs); // <- add this
            updateUserData(updatedData);
        }

        setShowAddModal(false);
        setEditForm({});
        console.log("The updated Envs are: ", updatedEnvs, " and the user id is: ", userid);
        if (!user?.uid) throw new Error('No User is logged in right now');
        savePersonalEnvironments(user?.uid, updatedEnvs);
    };


    const handleEnvironmentDelete = (envId: string) => {
        const updatedEnvs = environments.filter(e => e.id !== envId);
        setEnvironments(updatedEnvs);

        if (teamMode) {
            const intermediateTeamMode = { ...teamMode, environments: updatedEnvs };
            setTeamMode(intermediateTeamMode);
            updateTeamEnvironments(teamMode.teamId, updatedEnvs);
        }

        // Update Firebase
        if (userData && !teamMode) {
            const updatedData = updatePersonalEnvironments(userData, updatedEnvs); // 🔧 fallback
            updateUserData(updatedData);
        }

        if (activeEnvironment?.id === envId) {
            setActiveEnvironment(updatedEnvs[0] || null);
        }

        setShowDeleteConfirm(false);
    };

    const handleEnvironmentUpdate = (updatedEnv: Environment) => {
        const updatedEnvs = environments.map(e =>
            e.id === updatedEnv.id ? updatedEnv : e
        );

        setEnvironments(updatedEnvs);
        setActiveEnvironment(updatedEnv);

        if (teamMode) {
            const intermediateTeamMode = { ...teamMode, environments: updatedEnvs };
            setTeamMode(intermediateTeamMode);
            updateTeamEnvironments(teamMode.teamId, updatedEnvs);
        }

        if (userData && !teamMode) {
            const updatedData = updatePersonalEnvironments(userData, updatedEnvs); // ✅ fix
            updateUserData(updatedData);
        }

        setIsEditing(false);
    };


    const handleVariableAdd = (newVar: Omit<Variable, 'id'>) => {
        if (!activeEnvironment) return

        const updatedEnv = {
            ...activeEnvironment,
            variables: [...activeEnvironment.variables, newVar]
        }
        handleEnvironmentUpdate(updatedEnv)
    }

    const handleVariableUpdate = (varName: string, newValue: string) => {
        if (!activeEnvironment) return

        const updatedEnv = {
            ...activeEnvironment,
            variables: activeEnvironment.variables.map(v =>
                v.name === varName ? { ...v, value: newValue } : v
            )
        }
        handleEnvironmentUpdate(updatedEnv)
    }

    const handleVariableDelete = (varName: string) => {
        if (!activeEnvironment) return

        const updatedEnv = {
            ...activeEnvironment,
            variables: activeEnvironment.variables.filter(v => v.name !== varName)
        }
        handleEnvironmentUpdate(updatedEnv)
    }

    const startEditing = () => {
        if (activeEnvironment) {
            setEditForm({
                name: activeEnvironment.name,
                description: activeEnvironment.description,
                color: activeEnvironment.color,
                isShared: activeEnvironment.isShared
            })
            setIsEditing(true)
        }
    }

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

        setEditForm({
            ...editForm,
            [name]: type === 'checkbox' ? checked : value
        })
    }

    const handleColorSelect = (color: string) => {
        setEditForm({
            ...editForm,
            color
        })
    }

    const saveChanges = () => {
        if (activeEnvironment && editForm.name) {
            const updatedEnv = {
                ...activeEnvironment,
                ...editForm
            }
            handleEnvironmentUpdate(updatedEnv)
        }
    }

    // Add this handler for exiting team mode
    const handleExitTeamMode = () => {
        setTeamMode(null);
        localStorage.removeItem('teamMode');

        // Reset environment when exiting team mode
        setActiveEnvironment(null);
        localStorage.removeItem('activeEnvironmentId');

        // Refresh the page to reset all states
        window.location.reload();
    };

    // Add this handler for team selection
    const handleTeamSelect = (team: Team | null) => {
        setTeamMode(team);
        localStorage.setItem('teamMode', JSON.stringify(team));
        setShowTeamsDropdown(false);

        // Reset environment when switching teams
        setActiveEnvironment(null);
        localStorage.removeItem('activeEnvironmentId');
    };



    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <HeaderComponent
                    toSearch={false}
                    parentComponent={'Request Builder'}
                    onAddCollection={() => { }}
                    environments={environments}
                    initials={initials}
                    username={username}
                    email={email}
                    displayName={displayName}
                    teams={teams}
                    autoSave={autoSave}
                    setAutoSave={setAutoSave}
                    activeEnvironmentId={activeEnvironment?.id || ''}
                    onEnvironmentSelect={() => { }}
                    onExitTeamMode={handleExitTeamMode}
                    onTeamSelect={handleTeamSelect}
                    setShowTeams={setShowTeamsDropdown}
                    showTeams={showTeamsDropdown}
                    teamMode={teamMode}
                    photoURL={photoURL}
                />

                {/* Environments Content */}
                <main className="flex-1 overflow-hidden flex">
                    {/* Environments List */}
                    <EnvironmentsList
                        environments={environments}
                        activeEnvironmentId={activeEnvironment?.id || null}
                        onEnvironmentSelect={handleEnvironmentSelect}
                        onAddClick={() => setShowAddModal(true)}
                        onEnvironmentDelete={handleEnvironmentDelete}
                        onEnvironmentUpdate={handleEnvironmentUpdate}
                    />

                    {/* Environment Details */}
                    {activeEnvironment ? (
                        <div className="flex-1 bg-white dark:bg-gray-800 overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        <div
                                            className="w-4 h-4 rounded-full mr-2"
                                            style={{ backgroundColor: activeEnvironment.color || '#3b82f6' }}
                                        />
                                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                                            {activeEnvironment.name}
                                        </h2>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button type='button' title='edit'
                                            onClick={startEditing}
                                            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-colors cursor-pointer"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button type='button' title='showmodal'
                                            onClick={() => setShowShareModal(true)}
                                            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-colors cursor-pointer"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                            </svg>
                                        </button>
                                        <button type='button' title='condirmdelete'
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-colors cursor-pointer"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {isEditing ? (
                                    <EnvironmentSettings
                                        editForm={editForm}
                                        colorOptions={colorOptions}
                                        onEditChange={handleEditChange}
                                        onColorSelect={handleColorSelect}
                                        onSave={saveChanges}
                                        onCancel={() => setIsEditing(false)}
                                    />
                                ) : (
                                    <>
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
                                            <p className="text-gray-700 dark:text-gray-300">
                                                {activeEnvironment.description || 'No description provided'}
                                            </p>
                                        </div>

                                        <VariableTable
                                            variables={activeEnvironment.variables}
                                            onAdd={handleVariableAdd}
                                            onUpdate={handleVariableUpdate}
                                            onDelete={handleVariableDelete}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
                            <div className="text-center p-6">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                                    {environments.length === 0 ? 'No environments created yet' : 'No environment selected'}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {environments.length === 0
                                        ? 'Create your first environment to get started'
                                        : 'Select an environment from the sidebar'}
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Add Environment Modal */}
            <AddEnvironmentModal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false)
                    setEditForm({})
                }}
                onAdd={(env) => handleEnvironmentAdd(env)}
            />

            {/* Share Modal */}
            {showShareModal && activeEnvironment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                            Share Environment
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Share &quot;{activeEnvironment.name}&quot; with your team members
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Share Link
                            </label>
                            <div className="flex">
                                <input placeholder='' title='environment-edit'
                                    type="text"
                                    readOnly
                                    value={`${window.location.origin}/share/env/${activeEnvironment.id}`}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/share/env/${activeEnvironment.id}`)
                                    }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 mr-2"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && activeEnvironment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                            Delete Environment
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete &quot;{activeEnvironment.name}&quot;? This action cannot be undone.
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleEnvironmentDelete(activeEnvironment.id)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}