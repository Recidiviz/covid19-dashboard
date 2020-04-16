const ProjectionsHeader: React.FC = () => {
  return (
    <div className="border-t border-b border-gray-300 mt-5 mb-5 py-2 flex flex-row">
      <div className="w-2/5 flex flex-row">
        <div className="w-1/4">Cases</div>
        <div className="w-3/4">Facility</div>
      </div>
      <div className="w-3/5 flex flex-row justify-between">
        <div>Projection</div>
        <div>
          <span className="ml-6">Fatalities</span>
          <span className="ml-6">Exposed</span>
          <span className="ml-6">Infectious</span>
          <span className="ml-6">Hospitalized</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectionsHeader;
