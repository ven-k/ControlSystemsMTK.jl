var documenterSearchIndex = {"docs":
[{"location":"api/#Exported-functions-and-types","page":"API","title":"Exported functions and types","text":"","category":"section"},{"location":"api/#Index","page":"API","title":"Index","text":"","category":"section"},{"location":"api/","page":"API","title":"API","text":"","category":"page"},{"location":"api/#Docstrings","page":"API","title":"Docstrings","text":"","category":"section"},{"location":"api/","page":"API","title":"API","text":"Modules = [ControlSystemsMTK]\nPrivate = false","category":"page"},{"location":"api/#ModelingToolkit.ODESystem-Tuple{AbstractStateSpace}","page":"API","title":"ModelingToolkit.ODESystem","text":"ModelingToolkit.ODESystem(sys::AbstractStateSpace; name::Symbol, x0 = zeros(sys.nx), x_names, u_names, y_names)\n\nCreate an ODESystem from sys::StateSpace. \n\nArguments:\n\nsys: An instance of StateSpace or NamedStateSpace.\nname: A symbol giving the system a unique name.\nx0: Initial state\n\nThe arguments below are automatically set if the system is a NamedStateSpace.\n\nx_names: A vector of symbols with state names. \nu_names: A vector of symbols with input names. \ny_names: A vector of symbols with output names. \n\n\n\n\n\n","category":"method"},{"location":"api/#ControlSystemsBase.feedback-Tuple{T} where T<:AbstractTimeDependentSystem","page":"API","title":"ControlSystemsBase.feedback","text":"G = ControlSystemsBase.feedback(loopgain::T; name)\n\nForm the feedback-interconnection G = L(1+L)\n\nThe system G will be a new system with input and output connectors.\n\n\n\n\n\n","category":"method"},{"location":"api/#ControlSystemsMTK.batch_ss-Tuple","page":"API","title":"ControlSystemsMTK.batch_ss","text":"batch_ss(sys, inputs, outputs, ops::AbstractVector{<:AbstractDict};\n            t = 0.0,\n            allow_input_derivatives = false,\n            zero_dummy_der = false,\n            kwargs...)\n\nLinearize sys in multiple operating points ops::Vector{Dict}. Returns a vector of StateSpace objects and the simplified system.\n\nExample:\n\nusing ControlSystemsMTK, ModelingToolkit, RobustAndOptimalControl\nusing ModelingToolkit: getdefault\nunsafe_comparisons(true)\n\n# Create a model\n@parameters t k=10 k3=2 c=1\n@variables x(t)=0 [bounds = (-2, 2)]\n@variables v(t)=0\n@variables u(t)=0\n@variables y(t)=0\n\nD = Differential(t)\n\neqs = [D(x) ~ v\n       D(v) ~ -k * x - k3 * x^3 - c * v + 10u\n       y ~ x]\n\n\n@named duffing = ODESystem(eqs, t)\n\nbounds = getbounds(duffing, states(duffing))\nsample_within_bounds((l, u)) = (u - l) * rand() + l\n# Create a vector of operating points\nops = map(1:N) do i\n    op = Dict(x => sample_within_bounds(bounds[x]) for x in keys(bounds) if isfinite(bounds[x][1]))\nend\n\n\nPs, ssys = batch_ss(duffing, [u], [y], ops)\nw = exp10.(LinRange(-2, 2, 200))\nbodeplot(Ps, w)\nP = RobustAndOptimalControl.ss2particles(Ps) # convert to a single StateSpace system with `Particles` as coefficients.\nbodeplot(P, w) # Should look similar to the one above\n\nLet's also do some tuning for the linearized models above\n\nfunction batch_tune(f, Ps)\n    f.(Ps)\nend\n\nCs = batch_tune(Ps) do P\n    # C, kp, ki, fig, CF = loopshapingPI(P, 6; phasemargin=45)\n    C, kp, ki, kd, fig, CF = loopshapingPID(P, 6; Mt=1.3, Tf = 1/100)\n    ss(CF)\nend\n\nP = RobustAndOptimalControl.ss2particles(Ps)\nC = RobustAndOptimalControl.ss2particles(Cs)\n\nnyquistplot(P * C,\n            w,\n            ylims = (-10, 3),\n            xlims = (-5, 10),\n            points = true,\n            Ms_circles = [1.5, 2],\n            Mt_circles = [1.5, 2])\n\n# Fit circles that encircles the Nyquist curve for each frequency\ncenters, radii = fit_complex_perturbations(P * C, w; relative = false, nominal = :center)\nnyquistcircles!(w, centers, radii, ylims = (-4, 1), xlims = (-3, 4))\n\n\n\n\n\n","category":"method"},{"location":"api/#ControlSystemsMTK.build_quadratic_cost_matrix-Tuple{NamedTuple, ODESystem, AbstractVector{<:Pair}}","page":"API","title":"ControlSystemsMTK.build_quadratic_cost_matrix","text":"build_quadratic_cost_matrix(matrices::NamedTuple, ssys::ODESystem, costs::Vector{Pair})\n\nFor a system that has been linearized, assemble a quadratic cost matrix (for LQR or Kalman filtering) that penalizes states or outputs of simplified system ssys accoring to the vector of pairs costs.\n\nThe motivation for this function is that ModelingToolkit does not guarantee\n\nWhich states are selected as states after simplification.\nThe order of the states.\n\nThe second problem above, the ordering of the states, can be worked around using reorder_states, but the first problem cannot be solved by trivial reordering. This function thus accepts an array of costs for a user-selected state realization, and assembles the correct cost matrix for the state realization selected by MTK. To do this, the funciton needs the linearization (matrices) as well as the simplified system, both of which are outputs of linearize.\n\nArguments:\n\nmatrices: Output of linearize, an object containing a property called C.\nssys: Output of linearize.\ncosts: A vector of pairs\n\n\n\n\n\n","category":"method"},{"location":"api/#ControlSystemsMTK.build_quadratic_cost_matrix-Tuple{ODESystem, AbstractVector, AbstractVector{<:Pair}}","page":"API","title":"ControlSystemsMTK.build_quadratic_cost_matrix","text":"build_quadratic_cost_matrix(sys::ODESystem, inputs::Vector, costs::Vector{Pair}; kwargs...)\n\nAssemble a quadratic cost matrix (for LQR or Kalman filtering) that penalizes states or outputs of system sys accoring to the vector of pairs costs.\n\nThe motivation for this function is that ModelingToolkit does not guarantee\n\nWhich states are selected as states after simplification.\nThe order of the states.\n\nThe second problem above, the ordering of the states, can be worked around using reorder_states, but the first problem cannot be solved by trivial reordering. This function thus accepts an array of costs for a user-selected state realization, and assembles the correct cost matrix for the state realization selected by MTK. To do this, the funciton needs the linearization (matrices) as well as the simplified system, both of which are outputs of linearize.\n\nArguments:\n\ninputs: A vector of variables that are to be considered controlled inputs for the LQR controller.\ncosts: A vector of pairs.\n\n\n\n\n\n","category":"method"},{"location":"api/#ControlSystemsMTK.sconnect-Union{Tuple{T}, Tuple{Any, T}} where T<:AbstractTimeDependentSystem","page":"API","title":"ControlSystemsMTK.sconnect","text":"sconnect(input, sys::T; name)\n\n\n\n\n\n","category":"method"},{"location":"api/#ControlSystemsMTK.sconnect-Union{Tuple{T}, Tuple{Function, T}} where T<:AbstractTimeDependentSystem","page":"API","title":"ControlSystemsMTK.sconnect","text":"sconnect(input::Function, sys::T; name)\n\nConnect a function input(t) to sys.input\n\n\n\n\n\n","category":"method"},{"location":"api/#ControlSystemsMTK.sconnect-Union{Tuple{T}, Tuple{T, T}} where T<:AbstractTimeDependentSystem","page":"API","title":"ControlSystemsMTK.sconnect","text":"sconnect(sys1::T, sys2::T; name)\n\nConnect systems in series, equivalent to sys2*sys1 or series(sys1, sys2) in ControlSystems.jl terminology\n\n\n\n\n\n","category":"method"},{"location":"api/#RobustAndOptimalControl.named_ss-Tuple{AbstractTimeDependentSystem, Any, Any}","page":"API","title":"RobustAndOptimalControl.named_ss","text":"RobustAndOptimalControl.named_ss(sys::ModelingToolkit.AbstractTimeDependentSystem, inputs, outputs; kwargs...)\n\nConvert an ODESystem to a NamedStateSpace using linearization. inputs, outputs are vectors of variables determining the inputs and outputs respectively. See docstring of ModelingToolkit.linearize for more info on kwargs, reproduced below.\n\n(; A, B, C, D), simplified_sys = linearize(sys, inputs, outputs;    t=0.0, op = Dict(), allow_input_derivatives = false, kwargs...)\n(; A, B, C, D)                 = linearize(simplified_sys, lin_fun; t=0.0, op = Dict(), allow_input_derivatives = false)\n\nReturn a NamedTuple with the matrices of a linear statespace representation on the form\n\n$\n\n\\begin{aligned} ẋ &= Ax + Bu\\\ny &= Cx + Du \\end{aligned} $\n\nThe first signature automatically calls linearization_function internally, while the second signature expects the outputs of linearization_function as input.\n\nop denotes the operating point around which to linearize. If none is provided, the default values of sys are used.\n\nIf allow_input_derivatives = false, an error will be thrown if input derivatives (u) appear as inputs in the linearized equations. If input derivatives are allowed, the returned B matrix will be of double width, corresponding to the input [u; u̇].\n\nSee also linearization_function which provides a lower-level interface, and ModelingToolkit.reorder_states.\n\nSee extended help for an example.\n\nThe implementation and notation follows that of \"Linear Analysis Approach for Modelica Models\", Allain et al. 2009\n\nExtended help\n\nThis example builds the following feedback interconnection and linearizes it from the input of F to the output of P.\n\n\n  r ┌─────┐       ┌─────┐     ┌─────┐\n───►│     ├──────►│     │  u  │     │\n    │  F  │       │  C  ├────►│  P  │ y\n    └─────┘     ┌►│     │     │     ├─┬─►\n                │ └─────┘     └─────┘ │\n                │                     │\n                └─────────────────────┘\n\nusing ModelingToolkit\n@variables t\nfunction plant(; name)\n    @variables x(t) = 1\n    @variables u(t)=0 y(t)=0\n    D = Differential(t)\n    eqs = [D(x) ~ -x + u\n           y ~ x]\n    ODESystem(eqs, t; name = name)\nend\n\nfunction ref_filt(; name)\n    @variables x(t)=0 y(t)=0\n    @variables u(t)=0 [input=true]\n    D = Differential(t)\n    eqs = [D(x) ~ -2 * x + u\n           y ~ x]\n    ODESystem(eqs, t, name = name)\nend\n\nfunction controller(kp; name)\n    @variables y(t)=0 r(t)=0 u(t)=0\n    @parameters kp = kp\n    eqs = [\n        u ~ kp * (r - y),\n    ]\n    ODESystem(eqs, t; name = name)\nend\n\n@named f = ref_filt()\n@named c = controller(1)\n@named p = plant()\n\nconnections = [f.y ~ c.r # filtered reference to controller reference\n               c.u ~ p.u # controller output to plant input\n               p.y ~ c.y]\n\n@named cl = ODESystem(connections, t, systems = [f, c, p])\n\nlsys, ssys = linearize(cl, [f.u], [p.x])\ndesired_order =  [f.x, p.x]\nlsys = ModelingToolkit.reorder_states(lsys, states(ssys), desired_order)\n\n@assert lsys.A == [-2 0; 1 -2]\n@assert lsys.B == [1; 0;;]\n@assert lsys.C == [0 1]\n@assert lsys.D[] == 0\n\nModelingToolkit.linearize(sys, input_name::Symbol, output_name::Symbol; kwargs...)\n\nLinearize a system between two analysis points. To get a loop-transfer function, see get_looptransfer\n\n\n\n\n\n","category":"method"},{"location":"api/","page":"API","title":"API","text":"linearize\nlinearization_function\nnamed_ss\nModelingToolkit.reorder_states\nModelingToolkitStandardLibrary.Blocks.get_looptransfer\nbodeplot","category":"page"},{"location":"api/#ModelingToolkit.linearize","page":"API","title":"ModelingToolkit.linearize","text":"ModelingToolkit.linearize(sys, input_name::Symbol, output_name::Symbol; kwargs...)\n\nLinearize a system between two analysis points. To get a loop-transfer function, see get_looptransfer\n\n\n\n\n\n(; A, B, C, D), simplified_sys = linearize(sys, inputs, outputs;    t=0.0, op = Dict(), allow_input_derivatives = false, kwargs...)\n(; A, B, C, D)                 = linearize(simplified_sys, lin_fun; t=0.0, op = Dict(), allow_input_derivatives = false)\n\nReturn a NamedTuple with the matrices of a linear statespace representation on the form\n\nbeginaligned\nx = Ax + Bu\ny = Cx + Du\nendaligned\n\nThe first signature automatically calls linearization_function internally, while the second signature expects the outputs of linearization_function as input.\n\nop denotes the operating point around which to linearize. If none is provided, the default values of sys are used.\n\nIf allow_input_derivatives = false, an error will be thrown if input derivatives (u) appear as inputs in the linearized equations. If input derivatives are allowed, the returned B matrix will be of double width, corresponding to the input [u; u̇].\n\nSee also linearization_function which provides a lower-level interface, and ModelingToolkit.reorder_states.\n\nSee extended help for an example.\n\nThe implementation and notation follows that of \"Linear Analysis Approach for Modelica Models\", Allain et al. 2009\n\nExtended help\n\nThis example builds the following feedback interconnection and linearizes it from the input of F to the output of P.\n\n\n  r ┌─────┐       ┌─────┐     ┌─────┐\n───►│     ├──────►│     │  u  │     │\n    │  F  │       │  C  ├────►│  P  │ y\n    └─────┘     ┌►│     │     │     ├─┬─►\n                │ └─────┘     └─────┘ │\n                │                     │\n                └─────────────────────┘\n\nusing ModelingToolkit\n@variables t\nfunction plant(; name)\n    @variables x(t) = 1\n    @variables u(t)=0 y(t)=0\n    D = Differential(t)\n    eqs = [D(x) ~ -x + u\n           y ~ x]\n    ODESystem(eqs, t; name = name)\nend\n\nfunction ref_filt(; name)\n    @variables x(t)=0 y(t)=0\n    @variables u(t)=0 [input=true]\n    D = Differential(t)\n    eqs = [D(x) ~ -2 * x + u\n           y ~ x]\n    ODESystem(eqs, t, name = name)\nend\n\nfunction controller(kp; name)\n    @variables y(t)=0 r(t)=0 u(t)=0\n    @parameters kp = kp\n    eqs = [\n        u ~ kp * (r - y),\n    ]\n    ODESystem(eqs, t; name = name)\nend\n\n@named f = ref_filt()\n@named c = controller(1)\n@named p = plant()\n\nconnections = [f.y ~ c.r # filtered reference to controller reference\n               c.u ~ p.u # controller output to plant input\n               p.y ~ c.y]\n\n@named cl = ODESystem(connections, t, systems = [f, c, p])\n\nlsys, ssys = linearize(cl, [f.u], [p.x])\ndesired_order =  [f.x, p.x]\nlsys = ModelingToolkit.reorder_states(lsys, states(ssys), desired_order)\n\n@assert lsys.A == [-2 0; 1 -2]\n@assert lsys.B == [1; 0;;]\n@assert lsys.C == [0 1]\n@assert lsys.D[] == 0\n\n\n\n\n\n","category":"function"},{"location":"api/#ModelingToolkit.linearization_function","page":"API","title":"ModelingToolkit.linearization_function","text":"lin_fun, simplified_sys = linearization_function(sys::AbstractSystem, inputs, outputs; simplify = false, kwargs...)\n\nReturn a function that linearizes system sys. The function linearize provides a higher-level and easier to use interface.\n\nlin_fun is a function (variables, p, t) -> (; f_x, f_z, g_x, g_z, f_u, g_u, h_x, h_z, h_u), i.e., it returns a NamedTuple with the Jacobians of f,g,h for the nonlinear sys (technically for simplified_sys) on the form\n\nx = f(x z u)\n0 = g(x z u)\ny = h(x z u)\n\nwhere x are differential states, z algebraic states, u inputs and y outputs. To obtain a linear statespace representation, see linearize. The input argument variables is a vector defining the operating point, corresponding to states(simplified_sys) and p is a vector corresponding to the parameters of simplified_sys. Note: all variables in inputs have been converted to parameters in simplified_sys.\n\nThe simplified_sys has undergone structural_simplify and had any occurring input or output variables replaced with the variables provided in arguments inputs and outputs. The states of this system also indicates the order of the states that holds for the linearized matrices.\n\nArguments:\n\nsys: An ODESystem. This function will automatically apply simplification passes on sys and return the resulting simplified_sys.\ninputs: A vector of variables that indicate the inputs of the linearized input-output model.\noutputs: A vector of variables that indicate the outputs of the linearized input-output model.\nsimplify: Apply simplification in tearing.\nkwargs: Are passed on to find_solvables!\n\nSee also linearize which provides a higher-level interface.\n\n\n\n\n\n","category":"function"},{"location":"api/#RobustAndOptimalControl.named_ss","page":"API","title":"RobustAndOptimalControl.named_ss","text":"RobustAndOptimalControl.named_ss(sys::ModelingToolkit.AbstractTimeDependentSystem, inputs, outputs; kwargs...)\n\nConvert an ODESystem to a NamedStateSpace using linearization. inputs, outputs are vectors of variables determining the inputs and outputs respectively. See docstring of ModelingToolkit.linearize for more info on kwargs, reproduced below.\n\n(; A, B, C, D), simplified_sys = linearize(sys, inputs, outputs;    t=0.0, op = Dict(), allow_input_derivatives = false, kwargs...)\n(; A, B, C, D)                 = linearize(simplified_sys, lin_fun; t=0.0, op = Dict(), allow_input_derivatives = false)\n\nReturn a NamedTuple with the matrices of a linear statespace representation on the form\n\n$\n\n\\begin{aligned} ẋ &= Ax + Bu\\\ny &= Cx + Du \\end{aligned} $\n\nThe first signature automatically calls linearization_function internally, while the second signature expects the outputs of linearization_function as input.\n\nop denotes the operating point around which to linearize. If none is provided, the default values of sys are used.\n\nIf allow_input_derivatives = false, an error will be thrown if input derivatives (u) appear as inputs in the linearized equations. If input derivatives are allowed, the returned B matrix will be of double width, corresponding to the input [u; u̇].\n\nSee also linearization_function which provides a lower-level interface, and ModelingToolkit.reorder_states.\n\nSee extended help for an example.\n\nThe implementation and notation follows that of \"Linear Analysis Approach for Modelica Models\", Allain et al. 2009\n\nExtended help\n\nThis example builds the following feedback interconnection and linearizes it from the input of F to the output of P.\n\n\n  r ┌─────┐       ┌─────┐     ┌─────┐\n───►│     ├──────►│     │  u  │     │\n    │  F  │       │  C  ├────►│  P  │ y\n    └─────┘     ┌►│     │     │     ├─┬─►\n                │ └─────┘     └─────┘ │\n                │                     │\n                └─────────────────────┘\n\nusing ModelingToolkit\n@variables t\nfunction plant(; name)\n    @variables x(t) = 1\n    @variables u(t)=0 y(t)=0\n    D = Differential(t)\n    eqs = [D(x) ~ -x + u\n           y ~ x]\n    ODESystem(eqs, t; name = name)\nend\n\nfunction ref_filt(; name)\n    @variables x(t)=0 y(t)=0\n    @variables u(t)=0 [input=true]\n    D = Differential(t)\n    eqs = [D(x) ~ -2 * x + u\n           y ~ x]\n    ODESystem(eqs, t, name = name)\nend\n\nfunction controller(kp; name)\n    @variables y(t)=0 r(t)=0 u(t)=0\n    @parameters kp = kp\n    eqs = [\n        u ~ kp * (r - y),\n    ]\n    ODESystem(eqs, t; name = name)\nend\n\n@named f = ref_filt()\n@named c = controller(1)\n@named p = plant()\n\nconnections = [f.y ~ c.r # filtered reference to controller reference\n               c.u ~ p.u # controller output to plant input\n               p.y ~ c.y]\n\n@named cl = ODESystem(connections, t, systems = [f, c, p])\n\nlsys, ssys = linearize(cl, [f.u], [p.x])\ndesired_order =  [f.x, p.x]\nlsys = ModelingToolkit.reorder_states(lsys, states(ssys), desired_order)\n\n@assert lsys.A == [-2 0; 1 -2]\n@assert lsys.B == [1; 0;;]\n@assert lsys.C == [0 1]\n@assert lsys.D[] == 0\n\nModelingToolkit.linearize(sys, input_name::Symbol, output_name::Symbol; kwargs...)\n\nLinearize a system between two analysis points. To get a loop-transfer function, see get_looptransfer\n\n\n\n\n\n","category":"function"},{"location":"api/#ModelingToolkit.reorder_states","page":"API","title":"ModelingToolkit.reorder_states","text":"reorder_states(sys::NamedTuple, old, new)\n\nPermute the state representation of sys obtained from linearize so that the state order is changed from old to new Example:\n\nlsys, ssys = linearize(pid, [reference.u, measurement.u], [ctr_output.u])\ndesired_order = [int.x, der.x] # States that are present in states(ssys)\nlsys = ModelingToolkit.reorder_states(lsys, states(ssys), desired_order)\n\nSee also ModelingToolkit.similarity_transform\n\n\n\n\n\n","category":"function"},{"location":"api/#ModelingToolkitStandardLibrary.Blocks.get_looptransfer","page":"API","title":"ModelingToolkitStandardLibrary.Blocks.get_looptransfer","text":"get_looptransfer(sys, ap::AnalysisPoint; kwargs)\nget_looptransfer(sys, ap_name::Symbol; kwargs)\n\nCompute the (linearized) loop-transfer function in analysis point ap, from ap.out to ap.in.\n\ndanger: Experimental\nThe analysis-point interface is currently experimental and at any time subject to breaking changes not respecting semantic versioning.\n\nArguments:\n\nkwargs: Are sent to ModelingToolkit.linearize\n\nSee also get_sensitivity, get_comp_sensitivity, open_loop.\n\n\n\n\n\n","category":"function"},{"location":"api/#ControlSystemsBase.bodeplot","page":"API","title":"ControlSystemsBase.bodeplot","text":"fig = bodeplot(sys, args...)\nbodeplot(LTISystem[sys1, sys2...], args...; plotphase=true, kwargs...)\n\nCreate a Bode plot of the LTISystem(s). A frequency vector w can be optionally provided. To change the Magnitude scale see setPlotScale(str)\n\nIf hz=true, the plot x-axis will be displayed in Hertz, the input frequency vector is still treated as rad/s.\n\nkwargs is sent as argument to RecipesBase.plot.\n\n\n\n\n\n","category":"function"},{"location":"batch_linearization/#Batch-Linearization-and-gain-scheduling","page":"Batch linearization and gain scheduling","title":"Batch Linearization and gain scheduling","text":"","category":"section"},{"location":"batch_linearization/","page":"Batch linearization and gain scheduling","title":"Batch linearization and gain scheduling","text":"This example will demonstrate how to linearize a nonlinear ModelingToolkit model in multiple different operating points, and some tools to work with groups of linear models representing the same system in different operating points.","category":"page"},{"location":"batch_linearization/#System-model","page":"Batch linearization and gain scheduling","title":"System model","text":"","category":"section"},{"location":"batch_linearization/","page":"Batch linearization and gain scheduling","title":"Batch linearization and gain scheduling","text":"The model will be a simple Duffing oscillator:","category":"page"},{"location":"batch_linearization/","page":"Batch linearization and gain scheduling","title":"Batch linearization and gain scheduling","text":"using ControlSystemsMTK, ModelingToolkit, MonteCarloMeasurements\nusing ModelingToolkit: getdefault\nunsafe_comparisons(true)\n\n# Create a model\n@parameters t k=10 k3=2 c=1\n@variables x(t)=0 [bounds = (-2, 2)]\n@variables v(t)=0\n@variables u(t)=0\n@variables y(t)=0\n\nD = Differential(t)\n\neqs = [D(x) ~ v\n       D(v) ~ -k * x - k3 * x^3 - c * v + 10u\n       y ~ x]\n\n\n@named duffing = ODESystem(eqs, t)","category":"page"},{"location":"batch_linearization/#Batch-linearization","page":"Batch linearization and gain scheduling","title":"Batch linearization","text":"","category":"section"},{"location":"batch_linearization/","page":"Batch linearization and gain scheduling","title":"Batch linearization and gain scheduling","text":"To perform batch linearization, we create a vector of operating points, and then linearize the model around each of these points. The function batch_ss does this for us, and returns a vector of StateSpace models, one for each operating point. An operating point is a Dict that maps variables in the MTK model to numerical values. In the example below, we simply sample the variables uniformly within their bounds specified when we created the variables (normally, we might want to linearize on stationary points)","category":"page"},{"location":"batch_linearization/","page":"Batch linearization and gain scheduling","title":"Batch linearization and gain scheduling","text":"N = 16 # Number of samples\nxs = range(getbounds(x)[1], getbounds(x)[2], length=N)\nops = Dict.(x .=> xs)","category":"page"},{"location":"batch_linearization/","page":"Batch linearization and gain scheduling","title":"Batch linearization and gain scheduling","text":"Just like ModelingToolkit.linearize, batch_ss takes the set of inputs and the set of outputs to linearize between.","category":"page"},{"location":"batch_linearization/","page":"Batch linearization and gain scheduling","title":"Batch linearization and gain scheduling","text":"Ps, ssys = batch_ss(duffing, [u], [y], ops)\nnothing # hide","category":"page"},{"location":"batch_linearization/","page":"Batch linearization and gain scheduling","title":"Batch linearization and gain scheduling","text":"Plotting functions like bodeplot accept vectors of systems, so this works","category":"page"},{"location":"batch_linearization/","page":"Batch linearization and gain scheduling","title":"Batch linearization and gain scheduling","text":"using ControlSystemsBase, Plots\nw = exp10.(LinRange(-2, 3, 200))\nbodeplot(Ps, w)","category":"page"},{"location":"batch_linearization/","page":"Batch linearization and gain scheduling","title":"Batch linearization and gain scheduling","text":"We can also convert the vector of system models to a single model with RobustAndOptimalControl.ss2particles, which will convert the coefficients of the state space models to MonteCarloMeasurements.Particles objects.","category":"page"},{"location":"batch_linearization/","page":"Batch linearization and gain scheduling","title":"Batch linearization and gain scheduling","text":"using RobustAndOptimalControl\nP = RobustAndOptimalControl.ss2particles(Ps) # convert to a single StateSpace system with `Particles` as coefficients.","category":"page"},{"location":"batch_linearization/","page":"Batch linearization and gain scheduling","title":"Batch linearization and gain scheduling","text":"notice how some coefficients are plotted like uncertain numbers -19.2 ± 7.6. We can plot such models as well:","category":"page"},{"location":"batch_linearization/","page":"Batch linearization and gain scheduling","title":"Batch linearization and gain scheduling","text":"bodeplot(P, w) # Should look similar to the one above","category":"page"},{"location":"batch_linearization/#Controller-tuning","page":"Batch linearization and gain scheduling","title":"Controller tuning","text":"","category":"section"},{"location":"batch_linearization/","page":"Batch linearization and gain scheduling","title":"Batch linearization and gain scheduling","text":"Let's also do some controller tuning for the linearized models above. The function batch_tune is not really required here, but it shows how we might go about building more sophisticated tools for batch tuning. In this example, we will tune a PID controller using the function loopshapingPID.","category":"page"},{"location":"batch_linearization/","page":"Batch linearization and gain scheduling","title":"Batch linearization and gain scheduling","text":"function batch_tune(f, Ps)\n    f.(Ps)\nend\n\nCs = batch_tune(Ps) do P\n    C, kp, ki, kd, fig, CF = loopshapingPID(P, 7; Mt=1.2, Tf = 1/100)\n    ss(CF)\nend\n\nP = RobustAndOptimalControl.ss2particles(Ps)\nC = RobustAndOptimalControl.ss2particles(Cs)\n\nnyquistplot(P * C,\n            w,\n            ylims = (-10, 2),\n            xlims = (-8, 5),\n            points = true,\n            Ms_circles = [1.5, 2],\n            Mt_circles = [1.2])","category":"page"},{"location":"batch_linearization/","page":"Batch linearization and gain scheduling","title":"Batch linearization and gain scheduling","text":"Above, we plotted the Nyquist curve of the loop-transfer function for all system realizations. RobustAndOptimalControl.jl has some facilities for fitting circles around the Nyquist curve for uncertain systems, which we could use here:","category":"page"},{"location":"batch_linearization/","page":"Batch linearization and gain scheduling","title":"Batch linearization and gain scheduling","text":"centers, radii = fit_complex_perturbations(P * C, w; relative = false, nominal = :center)\nnyquistcircles!(w, centers, radii, ylims = (-5, 1), xlims = (-3, 4))","category":"page"},{"location":"batch_linearization/","page":"Batch linearization and gain scheduling","title":"Batch linearization and gain scheduling","text":"some methods for robust control operate on such circles. Notice how the circles are conservative in many cases, this is typically due to the gain varying between the models for the same phase.","category":"page"},{"location":"batch_linearization/","page":"Batch linearization and gain scheduling","title":"Batch linearization and gain scheduling","text":"If you plot the Nyquist curve using the plotly() backend rather than the default gr() backend used here, you can hover the mouse over the curves and see which frequency they correspond to etc. ","category":"page"},{"location":"batch_linearization/#Gain-scheduling","page":"Batch linearization and gain scheduling","title":"Gain scheduling","text":"","category":"section"},{"location":"batch_linearization/","page":"Batch linearization and gain scheduling","title":"Batch linearization and gain scheduling","text":"Above, we tuned one controller for each operating point, wouldn't it be nice if we had some features to simulate a gain-scheduled controller that interpolates between the different controllers depending on the operating pont? Currently, we don't have that, so maybe we have to mention this to Santa next time we see him. ","category":"page"},{"location":"#ControlSystemsMTK.jl","page":"Home","title":"ControlSystemsMTK.jl","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"ControlSystemsMTK provides an interface between ControlSystems.jl and ModelingToolkit.jl.","category":"page"},{"location":"","page":"Home","title":"Home","text":"See the videos below for examples of using ControlSystems and ModelingToolkit together.","category":"page"},{"location":"","page":"Home","title":"Home","text":"<iframe style=\"height: 315px; width: 560px\" src=\"https://www.youtube.com/embed/favQKOyyx4o\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>","category":"page"},{"location":"","page":"Home","title":"Home","text":"<iframe style=\"height: 315px; width: 560px\" src=\"https://www.youtube.com/embed/Effifd9Th9I\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>","category":"page"},{"location":"#Installation","page":"Home","title":"Installation","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"pkg> add ControlSystemsMTK","category":"page"},{"location":"#From-ControlSystems-to-ModelingToolkit","page":"Home","title":"From ControlSystems to ModelingToolkit","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Simply calling ODESystem(sys) converts a StateSpace object from ControlSystems into the corresponding ModelingToolkitStandardLibrary.Blocks.StateSpace. If sys is a named statespace object, the names will be retained in the ODESystem.","category":"page"},{"location":"#Example:","page":"Home","title":"Example:","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"julia> using ControlSystemsMTK, ControlSystemsBase, ModelingToolkit, RobustAndOptimalControl\n\njulia> P0 = tf(1.0, [1, 1])  |> ss\nStateSpace{Continuous, Float64}\nA = \n -1.0\nB = \n 1.0\nC = \n 1.0\nD = \n 0.0\n\nContinuous-time state-space model\n\njulia> @named P = ODESystem(P0)\nModel P with 2 equations\nStates (3):\n  x[1](t) [defaults to 0.0]\n  input₊u(t) [defaults to 0.0]\n  output₊u(t) [defaults to 0.0]\nParameters (0):\n\njulia> equations(P)\n2-element Vector{Equation}:\n Differential(t)(x[1](t)) ~ input₊u(t) - x[1](t)\n output₊u(t) ~ x[1](t)","category":"page"},{"location":"#From-ModelingToolkit-to-ControlSystems","page":"Home","title":"From ModelingToolkit to ControlSystems","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"An ODESystem can be converted to a named statespace object from RobustAndOptimalControl.jl by calling named_ss","category":"page"},{"location":"","page":"Home","title":"Home","text":"named_ss(ode_sys, inputs, outputs; op)","category":"page"},{"location":"","page":"Home","title":"Home","text":"this performs a linearization of ode_sys around the operating point op (defaults to the default values of all variables in ode_sys).","category":"page"},{"location":"#Example:-2","page":"Home","title":"Example:","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Using P from above:","category":"page"},{"location":"","page":"Home","title":"Home","text":"julia> @unpack input, output = P;\n\njulia> P02_named = named_ss(P, [input.u], [output.u])\nNamedStateSpace{Continuous, Float64}\nA = \n -1.0\nB = \n 1.0\nC = \n 1.0\nD = \n 0.0\n\nContinuous-time state-space model\nWith state  names: x[1](t)\n     input  names: input₊u(t)\n     output names: output₊u(t)\n\njulia> using Plots;\n\njulia> bodeplot(P02_named)","category":"page"},{"location":"","page":"Home","title":"Home","text":"(Image: plot)","category":"page"},{"location":"","page":"Home","title":"Home","text":"julia> ss(P02_named) # Convert to a statespace system without names\nStateSpace{Continuous, Float64}\nA = \n -1.0\nB = \n 1.0\nC = \n 1.0\nD = \n 0.0\n\nContinuous-time state-space model","category":"page"},{"location":"","page":"Home","title":"Home","text":"ModelingToolkit tends to give weird names to inputs and outputs etc., to access variables easily, named_ss implements prefix matching, so that you can access the mapping from input₊u(t) to output₊u(t) by","category":"page"},{"location":"","page":"Home","title":"Home","text":"P02_named[:out, :in]","category":"page"},{"location":"","page":"Home","title":"Home","text":"To learn more about linearization of ModelingToolkit models, see the video below","category":"page"},{"location":"","page":"Home","title":"Home","text":"<iframe style=\"height: 315px; width: 560px\" src=\"https://www.youtube.com/embed/-XOux-2XDGI\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>","category":"page"},{"location":"#Additional-resources","page":"Home","title":"Additional resources","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Modeling for control using ModelingToolkit tutorial\nLinear Analysis tools in ModelingToolkit\nVideo demo using ControlSystems and MTK","category":"page"},{"location":"#Internals:-Transformation-of-non-proper-models-to-proper-statespace-form","page":"Home","title":"Internals: Transformation of non-proper models to proper statespace form","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"For some models, ModelingToolkit will fail to produce a proper statespace model (a non-proper model is differentiating the inputs, i.e., it has a numerator degree higher than the denominator degree if represented as a transfer function) when calling linearize. For such models, given on the form dot x = Ax + Bu + bar B dot u we create the following augmented descriptor model","category":"page"},{"location":"","page":"Home","title":"Home","text":"beginaligned\nsX = Ax + BU + sbar B U \nX_u = U\ns(X - bar B X_u) = AX + BU \ns beginbmatrixI  -bar B  0  0 endbmatrix = \nbeginbmatrix A  0  0  -Iendbmatrix\nbeginbmatrixX  X_u endbmatrix + \nbeginbmatrix B  I_uendbmatrix U \nsE = A_e x_e + B_e u\nendaligned","category":"page"},{"location":"","page":"Home","title":"Home","text":"where X_u is a new algebraic state variable and I_u is a selector matrix that picks out the differentiated inputs appearing in dot u (if all inputs appear, I_u = I).","category":"page"},{"location":"","page":"Home","title":"Home","text":"This model may be converted to a proper statespace model (if the system is indeed proper) using DescriptorSystems.dss2ss. All of this is handled automatically by named_ss(sys).","category":"page"}]
}
