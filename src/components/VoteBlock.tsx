export function VoteBlock({votes}: {votes: Record<string, boolean>}) {
    return <div>
        <h2> Votes </h2>
        {Object.entries(votes).map(([username, vote]) => 
            <p>
                <input disabled type="checkbox" checked={vote} />
                <label>{username}</label>
            </p>
        )}
    </div>;
}