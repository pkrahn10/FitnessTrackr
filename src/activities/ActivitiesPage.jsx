import useQuery from "../api/useQuery";
import useMutation from "../api/useMutation";
import { useAuth } from "../auth/AuthContext";

export default function ActivitiesPage() {
  const {
    data: activities,
    loading,
    error,
    invalidateTags,
  } = useQuery("/activities", "activities");

  const { token } = useAuth();

  const {
    mutate: addMutate,
    data: addedActivity,
    loading: adding,
    error: addError,
  } = useMutation("POST", "/activities", ["activities"]);

  const addActivity = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = FormData.get("name");
    const description = FormData.get("description");
    addMutate({ name, description });
    event.target.reset();
  };

  const {
    mutate: deleteMutate,
    data: deletedActivity,
    loading: deleting,
    error: deleteError,
  } = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/activities/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete");
      }
      return response.json();
    },
    onSuccess: () => {
      invalidateTags(["activities"]);
    },
  });

  const deleteActivity = (id) => {
    deleteMutate(id);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading activities.</p>;

  return (
    <>
      <h1>Activities</h1>
      {activities &&
        activities.map((activity) => {
          return (
            <p key={activity.id}>
              {activity.name}
              {token && (
                <button onClick={() => deleteActivity(activity.id)}>
                  Delete
                </button>
              )}
            </p>
          );
        })}
      {token && (
        <form onSubmit={addActivity}>
          <label>
            Name: <input name="name" />
          </label>
          <label>
            Description: <input name="description" />
          </label>
          <button type="submit" disabled={adding}>
            {adding ? "Adding..." : "Add"}
          </button>
          {addError && <p style={{ color: "red" }}>Error adding activity</p>}
        </form>
      )}
    </>
  );
}
